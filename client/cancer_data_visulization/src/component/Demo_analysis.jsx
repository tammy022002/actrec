"use client"

import { useState, useEffect, useRef } from "react"
import Footer1 from "./Footer1"
import { useNavigate } from "react-router-dom"
import "../assets/Demo_analysis.css"
import {
  TextField,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

import VariantInput from "../component/VariantInput"
import ValidationResult from "../component/ValidationResult"
import { validateVariant } from "../services/api"

const Demo_analysis = () => {
  const [hgvsp, setHgvsp] = useState("")
  const [transcriptId, setTranscriptId] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [slidingWindowData, setSlidingWindowData] = useState([])
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [error, setError] = useState(null)
  const [apiData, setApiData] = useState(null)
  const [targetIndex, setTargetIndex] = useState(21) // Default target index is 21
  const [windowSize, setWindowSize] = useState(3) // Default window size is 3
  const navigate = useNavigate()

  const [variantResult, setVariantResult] = useState(null)
  const [variantIsLoading, setVariantIsLoading] = useState(false)
  const [variantError, setVariantError] = useState(null)

  // Reference to the selected row for scrolling
  const selectedRowRef = useRef(null)

  const goTOVisulizationPage = () => {
    navigate("/querypage")
  }

  // Define the columns we want to display
  const columns = [
    "index", // Index column (1-based)
    "Ensembl_transcriptid",
    "HGVSc_snpEff",
    "HGVSp_snpEff",
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
    // Prediction columns
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
    // Score columns
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
    // Summary columns
    "rawPredictionSum", // Sum of all algorithm scores
    "slidingWindowScore", // Sliding window applied to raw sum
  ]

  // Scroll to selected row when it changes
  useEffect(() => {
    if (selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [selectedRecord])

  const handleSearch = async () => {
    if (!hgvsp || !transcriptId) {
      setError("Please enter both search parameters")
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("Search Parameters:", { hgvsp, transcriptId, windowSize })

      const response = await fetch("http://localhost:8088/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          HGVSc_snpEff: hgvsp,
          Ensembl_transcriptid: transcriptId,
          windowSize: windowSize, // Send window size to the backend
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const data = await response.json()
      console.log("API Response:", data)

      if (data.results.length === 0) {
        setError("No records found matching your search criteria")
        setResults([])
        setSlidingWindowData([])
        setApiData(null)
      } else {
        // Process the data to handle extreme cases
        const processedData = processDataForDisplay(data)

        setResults(processedData.results)
        setSlidingWindowData(processedData.slidingWindowData)
        setApiData(data) // Store the full API response

        // Set the selected record to the target index (21)
        setSelectedRecord(targetIndex)

        console.log("Selected record position:", targetIndex)
        console.log("Records before target:", data.totalBefore)
        console.log("Records after target:", data.totalAfter)
        console.log(
          "Selected record data:",
          processedData.results.find((r) => r.index === targetIndex),
        )
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("An error occurred while fetching data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Process data to handle extreme cases
  const processDataForDisplay = (data) => {
    const { results, slidingWindowData, totalBefore, totalAfter, matchPosition } = data

    // Calculate the starting index based on the number of records before the match
    // If there are fewer than 20 records before the match, adjust the starting index
    const startIndex = totalBefore < 20 ? 20 - totalBefore : 1

    // Reindex the results
    const reindexedResults = results.map((record, idx) => {
      return {
        ...record,
        index: startIndex + idx,
        isSelected: idx === matchPosition - 1, // -1 because matchPosition is 1-based
      }
    })

    // Reindex the sliding window data
    const reindexedSlidingWindowData = slidingWindowData.map((item, idx) => {
      return {
        ...item,
        index: startIndex + idx,
        isSelected: idx === matchPosition - 1,
      }
    })

    return {
      results: reindexedResults,
      slidingWindowData: reindexedSlidingWindowData,
    }
  }

  // Format sliding window data for the chart
  const chartData = slidingWindowData.map((item) => ({
    index: item.index,
    rawPredictionSum: item.value, // This is now the sliding window value of raw prediction sum
    HGVSc: item.HGVSc_snpEff || "",
    HGVSp: item.HGVSp_snpEff || "",
    Ensembl: item.Ensembl_transcriptid || "",
    isSelected: item.isSelected,
  }))

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          <p>
            <strong>Index:</strong> {label}
          </p>
          <p>
            <strong>Sliding Window point (Sliding Window):</strong> {payload[0].value.toFixed(3)}
          </p>
          <p>
            <strong>HGVSc:</strong> {payload[0].payload.HGVSc}
          </p>
          <p>
            <strong>HGVSp:</strong> {payload[0].payload.HGVSp}
          </p>
          <p>
            <strong>Ensembl:</strong> {payload[0].payload.Ensembl}
          </p>
        </div>
      )
    }
    return null
  }

  // Handle window size change
  const handleWindowSizeChange = (event) => {
    setWindowSize(event.target.value)
  }

  const handleValidate = async (variant, assembly, transcriptSet) => {
    setVariantIsLoading(true)
    setVariantError(null)
    try {
      const validationResult = await validateVariant(variant, assembly, transcriptSet)
      setVariantResult(validationResult)
    } catch (err) {
      setVariantError(err.message || "An error occurred during validation")
      setVariantResult(null)
    } finally {
      setVariantIsLoading(false)
    }
  }

  return (
    <>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20, marginBottom: 40 }}>
        <Paper elevation={3} style={{ padding: 20 }}>
          <Typography variant="h4" gutterBottom>
            Variant Validation
          </Typography>
          <VariantInput onValidate={handleValidate} isLoading={variantIsLoading} />
          {variantError && <div style={{ color: "red", margin: "10px 0" }}>{variantError}</div>}
          <ValidationResult result={variantResult} />
        </Paper>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
        <Button onClick={goTOVisulizationPage}>Explore Visulizations</Button>
        <Paper elevation={3} style={{ padding: 20, marginBottom: 80 }}>
          <Typography variant="h4" gutterBottom>
            Genetic Data Analysis
          </Typography>

          <Grid container spacing={2} style={{ marginBottom: 20 }}>
            <Grid item xs={12} md={4}>
              <TextField
                label="HGVSc_snpEff"
                placeholder="Enter HGVSc_snpEff value"
                value={hgvsp}
                onChange={(e) => setHgvsp(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Ensembl_transcriptid"
                placeholder="Enter Ensembl_transcriptid value"
                value={transcriptId}
                onChange={(e) => setTranscriptId(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="window-size-label">Sliding Window Size</InputLabel>
                <Select
                  labelId="window-size-label"
                  id="window-size-select"
                  value={windowSize}
                  onChange={handleWindowSizeChange}
                  label="Sliding Window Size"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((size) => (
                    <MenuItem key={size} value={size}>
                      {size}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" style={{ marginBottom: 20 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {slidingWindowData.length > 0 && !loading && (
          <Paper elevation={3} style={{ padding: 20, marginBottom: 20 }}>
            <Typography variant="h5" gutterBottom>
              Raw Prediction Sum Line Graph (Sliding Window Size: {windowSize})
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              This graph shows the sum of all prediction scores across all records using a sliding window approach. The
              selected record is highlighted with a vertical reference line at index {targetIndex}.
            </Typography>

            <div style={{ width: "100%", height: 400 }}>
              <ResponsiveContainer>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="index"
                    label={{
                      value: "Record Index",
                      position: "insideBottomRight",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    label={{
                      value: "Sliding Window point",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="rawPredictionSum"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 8 }}
                    name="Sliding Window point"
                  />
                  <ReferenceLine
                    x={targetIndex}
                    stroke="red"
                    strokeWidth={2}
                    label={{ value: "Selected", position: "top" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Paper>
        )}

        {results.length > 0 && !loading && (
          <Paper elevation={3} style={{ padding: 20 }}>
            <Typography variant="h5" gutterBottom>
              Search Results
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Showing {results.length} results with the selected record at index {targetIndex} highlighted in blue. The
              table includes all prediction columns from the database along with Raw Prediction Sum (sum of all
              algorithm scores) and Sliding Window Score ({windowSize}-point moving average of raw sums).
            </Typography>

            <TableContainer
              style={{
                maxHeight: 600,
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "auto",
                position: "relative", // Important for sticky positioning
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((column, colIndex) => {
                      // Calculate left position for sticky columns
                      let leftPosition = 0
                      if (column === "Ensembl_transcriptid") leftPosition = 60
                      else if (column === "HGVSc_snpEff") leftPosition = 230
                      else if (column === "HGVSp_snpEff") leftPosition = 380

                      const isSticky = ["index", "Ensembl_transcriptid", "HGVSc_snpEff", "HGVSp_snpEff"].includes(
                        column,
                      )

                      return (
                        <TableCell
                          key={column}
                          style={{
                            whiteSpace: "nowrap",
                            fontWeight: "bold",
                            position: isSticky ? "sticky" : "static",
                            left: column === "index" ? 0 : leftPosition,
                            zIndex: isSticky ? 3 : 1,
                            backgroundColor: "#f5f5f5",
                            padding: "12px 16px",
                            borderRight: "1px solid rgba(224, 224, 224, 1)",
                            minWidth: column === "index" ? 60 : column === "Ensembl_transcriptid" ? 170 : 120,
                            top: 0, // Ensure header stays at the top
                          }}
                        >
                          {column}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((record) => {
                    const isSelected = record.index === targetIndex

                    return (
                      <TableRow
                        key={record.index}
                        ref={isSelected ? selectedRowRef : null}
                        style={{
                          backgroundColor: isSelected ? "#e3f2fd" : record.index % 2 === 0 ? "#fafafa" : "white",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedRecord(record.index)}
                        hover
                      >
                        {columns.map((column) => {
                          let cellValue = record[column]

                          // Format numeric values to 3 decimal places
                          if (
                            (column === "consensusScore" ||
                              column === "rawPredictionSum" ||
                              column === "slidingWindowScore") &&
                            cellValue !== undefined
                          ) {
                            cellValue = Number.parseFloat(cellValue).toFixed(3)
                          }

                          // Calculate left position for sticky columns
                          let leftPosition = 0
                          if (column === "Ensembl_transcriptid") leftPosition = 60
                          else if (column === "HGVSc_snpEff") leftPosition = 230
                          else if (column === "HGVSp_snpEff") leftPosition = 380

                          const isSticky = ["index", "Ensembl_transcriptid", "HGVSc_snpEff", "HGVSp_snpEff"].includes(
                            column,
                          )

                          return (
                            <TableCell
                              key={column}
                              style={{
                                whiteSpace: "nowrap",
                                position: isSticky ? "sticky" : "static",
                                left: column === "index" ? 0 : leftPosition,
                                zIndex: isSticky ? 2 : 1,
                                backgroundColor: isSelected
                                  ? isSticky
                                    ? "#d1e9fc"
                                    : "#e3f2fd"
                                  : isSticky
                                    ? record.index % 2 === 0
                                      ? "#f5f5f5"
                                      : "#ffffff"
                                    : record.index % 2 === 0
                                      ? "#fafafa"
                                      : "white",
                                padding: "8px 16px",
                                borderRight: "1px solid rgba(224, 224, 224, 1)",
                                borderBottom: "1px solid rgba(224, 224, 224, 1)",
                                minWidth: column === "index" ? 60 : column === "Ensembl_transcriptid" ? 170 : 120,
                              }}
                            >
                              {cellValue !== undefined ? cellValue : "-"}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Always show the prediction scores summary for the target index */}
            <Box mt={4} p={2} border={1} borderColor="divider" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                Prediction Scores Summary for Selected Record
              </Typography>
              <Grid container spacing={2}>
                {results
                  .filter((record) => record.index === targetIndex)
                  .map((record) => {
                    // Get all prediction columns (both _pred and _score types)
                    const predictionCols = columns.filter(
                      (col) =>
                        (col.endsWith("_pred") ||
                          col.endsWith("_score") ||
                          col.includes("score") ||
                          col === "CADD_raw" ||
                          col === "DANN_score" ||
                          col === "Eigen-raw_coding_rankscore") &&
                        col !== "rawPredictionSum" &&
                        col !== "slidingWindowScore",
                    )

                    return (
                      <Grid container spacing={2} key={record.index}>
                        {predictionCols.map((col) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={col}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                              <Typography variant="subtitle2" color="textSecondary">
                                {col}
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {record[col] !== undefined ? record[col] : "-"}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                          <Paper elevation={2} sx={{ p: 2, bgcolor: "#f0f7ff" }}>
                            <Typography variant="subtitle2" color="primary">
                              Raw Prediction Sum
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {record.rawPredictionSum !== undefined
                                ? Number.parseFloat(record.rawPredictionSum).toFixed(3)
                                : "-"}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                          <Paper elevation={2} sx={{ p: 2, bgcolor: "#f0f7ff" }}>
                            <Typography variant="subtitle2" color="primary">
                              Sliding Window Score
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {record.slidingWindowScore !== undefined
                                ? Number.parseFloat(record.slidingWindowScore).toFixed(3)
                                : "-"}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    )
                  })}
              </Grid>
            </Box>
          </Paper>
        )}
      </div>
      <div className="footer1">
        <Footer1></Footer1>
      </div>
    </>
  )
}

export default Demo_analysis
