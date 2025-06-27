const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")

const app = express()
const port = 8088

app.use(express.json({ limit: "100mb" }))
app.use(express.urlencoded({ limit: "100mb", extended: true }))
app.use(express.static("public"))
// Middleware
app.use(cors())
app.use(express.json())

// MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Concept@123",
  database: "cancer_data",
})

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack)
    return
  }
  console.log("Connected to the MySQL database as id", connection.threadId)
})

// Route for signup
app.post("/signup", (req, res) => {
  const sql = "INSERT INTO login (name, email, password) VALUES (?, ?, ?)"
  const values = [req.body.name, req.body.email, req.body.password]

  connection.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error:", err)
      return res.json("Error")
    }
    return res.json(data)
  })
})

// Route for login
app.post("/login", (req, res) => {
  const sql = "SELECT * FROM login WHERE email=? AND password=?"

  connection.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) {
      console.error("Error:", err)
      return res.status(500).json({ message: "Internal Server Error" })
    }
    if (data.length > 0) {
      return res.json("Success")
    } else {
      return res.status(401).json({ message: "Invalid Email or Password" })
    }
  })
})






// 1. NS Query Type (Nonsynonymous SNP)
app.post("/api/query/ns", (req, res) => {
  const { chr, pos, ref, alt, refAA, altAA } = req.body

  let query, params

  // Check if amino acid info is provided
  if (refAA && altAA) {
    query = `
      SELECT * FROM exploded_data
      WHERE \`#chr\` = ? AND \`pos(1-based)\` = ? AND ref = ? AND alt = ? AND aaref = ? AND aaalt = ?
      
    `
    params = [chr, pos, ref, alt, refAA, altAA]
  } else {
    query = `
      SELECT * FROM dbnsfp_egfr_kras_subset
      WHERE chr = ? AND pos_1_based = ? AND ref = ? AND alt = ?
    
    `
    params = [chr, pos, ref, alt]
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.error("Error executing NS query:", err)
      return res.status(500).json({ error: "Database error", details: err.message })
    }

    res.json({
      queryType: "NS",
      params: req.body,
      count: results.length,
      results: results,
    })
  })
})

// 2. Genome Position Query
app.post("/api/query/position", (req, res) => {
  const { chr, pos } = req.body

  const query = `
    SELECT * FROM exploded_data
    WHERE \`#chr\` = ? AND \`pos(1-based)\` = ?
  
  `

  connection.query(query, [chr, pos], (err, results) => {
    if (err) {
      console.error("Error executing position query:", err)
      return res.status(500).json({ error: "Database error", details: err.message })
    }

    res.json({
      queryType: "Genome Position",
      params: req.body,
      count: results.length,
      results: results,
    })
  })
})

// 3. Gene Query
app.post("/api/query/gene", (req, res) => {
  const { queryType, value } = req.body

  let field
  switch (queryType) {
    case "gene_name":
      field = "genename"
      break
    case "gene_id":
      field = "Ensembl_geneid"
      break
    case "CCDS_id":
      field = "CCDS_id"
      break
    default:
      return res.status(400).json({ error: "Invalid gene query type" })
  }

  const query = `
    SELECT * FROM exploded_data
    WHERE ${field} = ?
    
  `

  connection.query(query, [value], (err, results) => {
    if (err) {
      console.error("Error executing gene query:", err)
      return res.status(500).json({ error: "Database error", details: err.message })
    }

    res.json({
      queryType: "Gene",
      subType: queryType,
      params: req.body,
      count: results.length,
      results: results,
    })
  })
})

// Get summary statistics for visualization
app.post("/api/query/stats", (req, res) => {
  const { results } = req.body

  if (!results || !Array.isArray(results) || results.length === 0) {
    return res.status(400).json({ error: "No results provided for statistics" })
  }

  // Example statistics we might want to calculate
  const geneCounts = {}
  const chrCounts = {}
  const altTypes = {}

  results.forEach((item) => {
    // Count by gene
    if (item.genename) {
      geneCounts[item.genename] = (geneCounts[item.genename] || 0) + 1
    }

    // Count by chromosome
    const chrField = item["#chr"] || item.chr
    if (chrField) {
      chrCounts[chrField] = (chrCounts[chrField] || 0) + 1
    }

    // Count by alt type
    if (item.alt) {
      altTypes[item.alt] = (altTypes[item.alt] || 0) + 1
    }
  })

  // Convert to arrays for charts
  const geneData = Object.entries(geneCounts).map(([name, count]) => ({ name, count }))
  const chrData = Object.entries(chrCounts).map(([name, count]) => ({ name, count }))
  const altData = Object.entries(altTypes).map(([name, count]) => ({ name, count }))

  res.json({
    geneData: geneData.sort((a, b) => b.count - a.count).slice(0, 10),
    chrData: chrData.sort((a, b) => b.count - a.count),
    altData,
  })
})

// New endpoint for advanced visualizations
app.post("/api/query/visualizations", (req, res) => {
  const { results } = req.body

  if (!results || !Array.isArray(results) || results.length === 0) {
    return res.status(400).json({ error: "No results provided for visualizations" })
  }

  // 1. Variant Distribution by Chromosome
  const chrDistribution = []
  const chrCounts = {}

  results.forEach((item) => {
    const chrField = item["#chr"] || item.chr
    if (chrField) {
      chrCounts[chrField] = (chrCounts[chrField] || 0) + 1
    }
  })

  Object.entries(chrCounts).forEach(([name, count]) => {
    chrDistribution.push({ name, count })
  })

  // 2. Amino Acid Change Frequency
  const aaChangeFrequency = []
  const aaChanges = {}

  results.forEach((item) => {
    if (item.aaref && item.aaalt) {
      const change = `${item.aaref}→${item.aaalt}`
      aaChanges[change] = (aaChanges[change] || 0) + 1
    }
  })

  Object.entries(aaChanges).forEach(([change, count]) => {
    aaChangeFrequency.push({ change, count })
  })

  // 3. Allele Change Type Frequency
  const alleleChangeFrequency = []
  const alleleChanges = {}

  results.forEach((item) => {
    if (item.ref && item.alt) {
      const change = `${item.ref}→${item.alt}`
      alleleChanges[change] = (alleleChanges[change] || 0) + 1
    }
  })

  Object.entries(alleleChanges).forEach(([change, count]) => {
    alleleChangeFrequency.push({ change, count })
  })

  // 4. Gene Hotspots (position-based frequency)
  const geneHotspots = []
  const positionCounts = {}

  results.forEach((item) => {
    const position = item["pos(1-based)"] || item.pos_1_based
    const gene = item.genename

    if (position && gene) {
      const key = `${gene}:${position}`
      positionCounts[key] = (positionCounts[key] || 0) + 1
    }
  })

  Object.entries(positionCounts).forEach(([key, count]) => {
    const [gene, position] = key.split(":")
    geneHotspots.push({
      gene,
      position: Number.parseInt(position),
      count,
      size: count * 5, // For visualization sizing
    })
  })

  // 5. Variant Impact Analysis
  const variantImpact = []
  const impactScores = {
    SIFT: 0,
    PolyPhen: 0,
    CADD: 0,
    MutationTaster: 0,
    REVEL: 0,
  }

  let scoreCount = 0

  results.forEach((item) => {
    // SIFT score (lower is more damaging)
    if (item.SIFT_score && !isNaN(Number.parseFloat(item.SIFT_score))) {
      impactScores["SIFT"] += 1 - Number.parseFloat(item.SIFT_score)
      scoreCount++
    }

    // PolyPhen score (higher is more damaging)
    if (item.Polyphen2_HDIV_score && !isNaN(Number.parseFloat(item.Polyphen2_HDIV_score))) {
      impactScores["PolyPhen"] += Number.parseFloat(item.Polyphen2_HDIV_score)
      scoreCount++
    }

    // CADD score (higher is more damaging)
    if (item.CADD_phred && !isNaN(Number.parseFloat(item.CADD_phred))) {
      impactScores["CADD"] += Number.parseFloat(item.CADD_phred) / 30 // Normalize to 0-1 range
      scoreCount++
    }

    // MutationTaster score
    if (item.MutationTaster_score && !isNaN(Number.parseFloat(item.MutationTaster_score))) {
      impactScores["MutationTaster"] += Number.parseFloat(item.MutationTaster_score)
      scoreCount++
    }

    // REVEL score
    if (item.REVEL_score && !isNaN(Number.parseFloat(item.REVEL_score))) {
      impactScores["REVEL"] += Number.parseFloat(item.REVEL_score)
      scoreCount++
    }
  })

  // Normalize scores
  if (scoreCount > 0) {
    Object.entries(impactScores).forEach(([category, totalScore]) => {
      variantImpact.push({
        category,
        score: totalScore / results.length,
      })
    })
  }

  res.json({
    chrDistribution: chrDistribution.sort((a, b) => b.count - a.count),
    aaChangeFrequency: aaChangeFrequency.sort((a, b) => b.count - a.count).slice(0, 10),
    alleleChangeFrequency: alleleChangeFrequency.sort((a, b) => b.count - a.count),
    geneHotspots: geneHotspots.sort((a, b) => b.count - a.count).slice(0, 20),
    variantImpact,
  })
})

//ENDPOINT FOR SEARCHING BY HGVSc_snpEff AND Ensembl_transcriptid
app.post("/api/search", (req, res) => {
  const { HGVSc_snpEff, Ensembl_transcriptid, windowSize = 3 } = req.body

  // Validate input - BOTH are required
  if (!HGVSc_snpEff || !Ensembl_transcriptid) {
    return res.status(400).json({ error: "Both Ensembl_transcriptid and HGVSc_snpEff are required" })
  }

  console.log(`Searching for record with HGVSc_snpEff=${HGVSc_snpEff} and Ensembl_transcriptid=${Ensembl_transcriptid}`)
  console.log(`Using sliding window size: ${windowSize}`)

  // Step 1: Find the matching record first to get its ID
  const findRecordQuery = "SELECT id FROM exploded_data WHERE HGVSc_snpEff = ? AND Ensembl_transcriptid = ? LIMIT 1"
  connection.query(findRecordQuery, [HGVSc_snpEff, Ensembl_transcriptid], (err, matchingRecords) => {
    if (err) {
      console.error("Error executing search query:", err)
      return res.status(500).json({ error: "Database error", details: err.message })
    }

    if (matchingRecords.length === 0) {
      return res.json({ results: [] })
    }

    // Get the ID of the matching record
    const matchingId = matchingRecords[0].id
    console.log("Found matching record with ID:", matchingId)

    // Step 2: Get the records with IDs around the matching ID
    // This query gets 20 records before and 20 records after the matching record
    const rangeQuery = `
      (SELECT * FROM exploded_data WHERE id < ? ORDER BY id DESC LIMIT 20)
      UNION ALL
      (SELECT * FROM exploded_data WHERE id = ?)
      UNION ALL
      (SELECT * FROM exploded_data WHERE id > ? ORDER BY id ASC LIMIT 20)
      ORDER BY id ASC
    `

    connection.query(rangeQuery, [matchingId, matchingId, matchingId], (rangeErr, rangeRecords) => {
      if (rangeErr) {
        console.error("Error fetching range:", rangeErr)
        return res.status(500).json({ error: "Database error", details: rangeErr.message })
      }

      console.log(`Fetched ${rangeRecords.length} records`)

      // Find the position of the matching record in the result set
      let positionInResults = -1
      for (let i = 0; i < rangeRecords.length; i++) {
        if (rangeRecords[i].id === matchingId) {
          positionInResults = i
          break
        }
      }

      // Handle edge case for records with low IDs
      if (matchingId <= 20) {
        positionInResults = positionInResults - 1
      }

      if (positionInResults === -1) {
        console.error("Could not find the matching record in the result set")
        return res.status(500).json({ error: "Matching record not found in result set" })
      }

      console.log(`Target record is at position ${positionInResults + 1} in results (0-based)`)

      // Select only the columns we want to display
      const selectedColumns = [
        "HGVSc_snpEff",
        "HGVSp_snpEff",
        "Ensembl_transcriptid",
        "#chr",
        "pos(1-based)",
        "ref",
        "alt",
        "aaref",
        "aaalt",
        "rs_dbSNP",
        "hg19_chr",
        "hg19_pos(1-based)",
        "hg18_chr",
        "hg18_pos(1-based)",
        "aapos",
        "genename",
        "Ensembl_geneid",
        "Ensembl_proteinid",
        "Uniprot_acc",
        "Uniprot_entry",
        "HGVSc_VEP",
        "HGVSp_VEP",
        "SIFT_pred",
        "SIFT4G_pred",
        "PROVEAN_pred",
        "Polyphen2_HVAR_pred",
        "Polyphen2_HDIV_pred",
        "MutationTaster_pred",
        "MutationAssessor_pred",
        "MetaSVM_pred",
        "MetaLR_pred",
        "MetaRNN_pred",
        "M-CAP_pred",
        "PrimateAI_pred",
        "DEOGEN2_pred",
        "Aloft_pred",
        "ClinPred_pred",
        "BayesDel_addAF_pred",
        "BayesDel_noAF_pred",
        "LIST-S2_pred",
        "ESM1b_pred",
        "AlphaMissense_pred",
        "fathmm-XF_coding_pred",
        "REVEL_score",
        "MetaRNN_score",
        "MutPred_score",
        "MVP_score",
        "gMVP_score2",
        "VARITY_R_score",
        "PHACTboost_score",
        "MutFormer_score",
        "MutScore_score",
        "CADD_raw",
        "DANN_score",
        "Eigen-raw_coding_rankscore",
        "Eigen-PC-raw_coding_rankscore",
        "SIFT_score",
        "SIFT4G_score",
        "VEST4_score",
        "MPC_score",
      ]

      // Prediction columns (excluding the first 21 which are identifiers and other data)
      const predictionColumns = selectedColumns.slice(22)
      // console.log("Prediction columns:", predictionColumns)

      // Filter the records to only include the columns we want and calculate raw prediction sum
      const filteredRecords = rangeRecords.map((record, index) => {
        const filteredRecord = {}

        // Add selected columns
        selectedColumns.forEach((column) => {
          filteredRecord[column] = record[column]
        })

        // Add the ID for reference
        filteredRecord.id = record.id

        // Calculate raw sum of prediction values
        let rawSum = 0
        let validPredictions = 0

        predictionColumns.forEach((column) => {
          const value = record[column]
          if (value) {
            // Try to convert to numeric value if possible
            const numericValue = Number.parseFloat(value)
            if (!isNaN(numericValue)) {
              rawSum += numericValue
              validPredictions++
            }
          }
        })

        // Store the raw sum
        filteredRecord.rawPredictionSum = validPredictions > 0 ? rawSum : 0

        // Add index for ordering (1-based)
        filteredRecord.index = index

        // Mark the record at the target position as the selected record
        filteredRecord.isSelected = index === positionInResults

        return filteredRecord
      })

      // Apply sliding window with user-specified window size to calculate smoothed raw prediction sums
      const slidingWindowData = []

      // First calculate sliding window values for raw prediction sums
      for (let i = 0; i < filteredRecords.length; i++) {
        let windowSum = 0
        let windowCount = 0

        // Calculate sum of raw prediction sums in the current window
        for (
          let j = Math.max(0, i - Math.floor(windowSize / 2));
          j <= Math.min(filteredRecords.length - 1, i + Math.floor(windowSize / 2));
          j++
        ) {
          windowSum += filteredRecords[j].rawPredictionSum
          windowCount++
        }

        // Calculate average for the window
        const windowAvg = windowCount > 0 ? windowSum / windowCount : 0

        // Store the sliding window value in the original record
        filteredRecords[i].slidingWindowScore = windowAvg

        slidingWindowData.push({
          index: i + 1, // 1-based indexing
          value: windowAvg,
          // Include identifiers from the record for reference
          id: filteredRecords[i].id,
          HGVSc_snpEff: filteredRecords[i].HGVSc_snpEff,
          HGVSp_snpEff: filteredRecords[i].HGVSp_snpEff,
          Ensembl_transcriptid: filteredRecords[i].Ensembl_transcriptid,
          isSelected: filteredRecords[i].isSelected,
        })
      }

      res.json({
        results: filteredRecords,
        slidingWindowData: slidingWindowData,
        matchPosition: positionInResults,
        totalBefore: positionInResults,
        totalAfter: filteredRecords.length - positionInResults - 1,
        matchingId: matchingId,
        windowSize: windowSize,
      })
    })
  })
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
