"use client"

import { useState } from "react"
import axios from "axios"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import {
  Stack,
  Text,
  DefaultButton,
  PrimaryButton,
  TextField,
  Dropdown,
  Spinner,
  MessageBar,
  MessageBarType,
  mergeStyleSets,
  Toggle,
} from "@fluentui/react"

const COLORS = [
  "#0078D4",
  "#107C10",
  "#FFB900",
  "#D83B01",
  "#E3008C",
  "#5C2D91",
  "#00B7C3",
  "#004E8C",
  "#867365",
  "#8764B8",
]

const styles = mergeStyleSets({
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: '"Segoe UI", sans-serif',
  },
  header: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#323130",
    marginBottom: "16px",
  },
  subHeader: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#323130",
    marginBottom: "12px",
    marginTop: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    marginBottom: "24px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  visualizationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  visualizationCard: {
    backgroundColor: "white",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    height: "400px",
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: "24px",
    "& .fluent-table": {
      width: "100%",
      borderCollapse: "collapse",
    },
    "& .fluent-table-header": {
      backgroundColor: "#f3f2f1",
    },
    "& .fluent-table-row:hover": {
      backgroundColor: "#f3f2f1",
    },
  },
  buttonContainer: {
    marginTop: "16px",
    marginBottom: "24px",
  },
  errorMessage: {
    marginBottom: "16px",
  },
  toggleContainer: {
    marginBottom: "16px",
  },
})

const QueryPage = () => {
  // State for query parameters
  const [queryType, setQueryType] = useState("ns")
  const [nsQuery, setNsQuery] = useState({ chr: "", pos: "", ref: "", alt: "", refAA: "", altAA: "" })
  const [positionQuery, setPositionQuery] = useState({ chr: "", pos: "" })
  const [geneQuery, setGeneQuery] = useState({ queryType: "gene_name", value: "" })

  // State for results and visualizations
  const [results, setResults] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showVisualizations, setShowVisualizations] = useState(true)

  // State for additional visualizations
  const [chrDistribution, setChrDistribution] = useState([])
  const [aaChangeFrequency, setAaChangeFrequency] = useState([])
  const [alleleChangeFrequency, setAlleleChangeFrequency] = useState([])
  const [geneHotspots, setGeneHotspots] = useState([])
  const [variantImpact, setVariantImpact] = useState([])

  // Handle input changes
  const handleNsInputChange = (e) => {
    const { name, value } = e.target
    setNsQuery((prev) => ({ ...prev, [name]: value }))
  }

  const handlePositionInputChange = (e) => {
    const { name, value } = e.target
    setPositionQuery((prev) => ({ ...prev, [name]: value }))
  }

  const handleGeneInputChange = (e) => {
    const { name, value } = e.target
    setGeneQuery((prev) => ({ ...prev, [name]: value }))
  }

  // Submit query
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResults([])
    setStats(null)
    setChrDistribution([])
    setAaChangeFrequency([])
    setAlleleChangeFrequency([])
    setGeneHotspots([])
    setVariantImpact([])

    try {
      let response

      switch (queryType) {
        case "ns":
          response = await axios.post("http://localhost:8088/api/query/ns", nsQuery)
          break
        case "position":
          response = await axios.post("http://localhost:8088/api/query/position", positionQuery)
          break
        case "gene":
          response = await axios.post("http://localhost:8088/api/query/gene", geneQuery)
          break
        default:
          throw new Error("Invalid query type")
      }

      setResults(response.data.results)

      // Get statistics for visualization
      if (response.data.results.length > 0) {
        const statsResponse = await axios.post("http://localhost:8088/api/query/stats", {
          results: response.data.results,
        })
        setStats(statsResponse.data)

        // Get additional visualizations
        const visualizationsResponse = await axios.post("http://localhost:8088/api/query/visualizations", {
          results: response.data.results,
        })

        setChrDistribution(visualizationsResponse.data.chrDistribution)
        setAaChangeFrequency(visualizationsResponse.data.aaChangeFrequency)
        setAlleleChangeFrequency(visualizationsResponse.data.alleleChangeFrequency)
        setGeneHotspots(visualizationsResponse.data.geneHotspots)
        setVariantImpact(visualizationsResponse.data.variantImpact)
      }
    } catch (err) {
      console.error("Error executing query:", err)
      setError(err.response?.data?.error || err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Generate columns for DetailsList
  const generateColumns = () => {
    if (results.length === 0) return []

    return Object.keys(results[0])
      .slice(0, 10)
      .map((key) => ({
        key: key,
        name: key,
        fieldName: key,
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        onRender: (item) => {
          return <span>{item[key]?.toString() || "-"}</span>
        },
      }))
  }

  const queryOptions = [
    { key: "ns", text: "NS (Nonsynonymous SNP)" },
    { key: "position", text: "Genome Position" },
    // { key: "gene", text: "Gene" },
  ]

  const geneQueryOptions = [
    { key: "gene_name", text: "Gene Name" },
    { key: "gene_id", text: "Gene ID" },
  ]

  return (
    <div className={styles.container}>
      <Text className={styles.header}>dbNSFP Genomic Variant Analysis Dashboard</Text>

      <div className={styles.card}>
        <Text className={styles.subHeader}>Query Parameters</Text>

        <Stack horizontal tokens={{ childrenGap: 16 }} style={{ marginBottom: 16 }}>
          {queryOptions.map((option) => (
            <DefaultButton
              key={option.key}
              text={option.text}
              primary={queryType === option.key}
              onClick={() => setQueryType(option.key)}
            />
          ))}
        </Stack>

        <form onSubmit={handleSubmit}>
          {queryType === "ns" && (
            <div className={styles.formGrid}>
              <TextField
                label="Chromosome"
                name="chr"
                value={nsQuery.chr}
                onChange={(e, value) => setNsQuery((prev) => ({ ...prev, chr: value }))}
                placeholder="e.g., Y"
                required
              />
              <TextField
                label="Position"
                name="pos"
                value={nsQuery.pos}
                onChange={(e, value) => setNsQuery((prev) => ({ ...prev, pos: value }))}
                placeholder="e.g., 140855"
                required
              />
              <TextField
                label="Reference"
                name="ref"
                value={nsQuery.ref}
                onChange={(e, value) => setNsQuery((prev) => ({ ...prev, ref: value }))}
                placeholder="e.g., A"
                required
              />
              <TextField
                label="Alternative"
                name="alt"
                value={nsQuery.alt}
                onChange={(e, value) => setNsQuery((prev) => ({ ...prev, alt: value }))}
                placeholder="e.g., C"
                required
              />
              <TextField
                label="Reference AA (optional)"
                name="refAA"
                value={nsQuery.refAA}
                onChange={(e, value) => setNsQuery((prev) => ({ ...prev, refAA: value }))}
                placeholder="e.g., M"
              />
              <TextField
                label="Alternative AA (optional)"
                name="altAA"
                value={nsQuery.altAA}
                onChange={(e, value) => setNsQuery((prev) => ({ ...prev, altAA: value }))}
                placeholder="e.g., L"
              />
            </div>
          )}

          {queryType === "position" && (
            <div className={styles.formGrid}>
              <TextField
                label="Chromosome"
                name="chr"
                value={positionQuery.chr}
                onChange={(e, value) => setPositionQuery((prev) => ({ ...prev, chr: value }))}
                placeholder="e.g., 10"
                required
              />
              <TextField
                label="Position"
                name="pos"
                value={positionQuery.pos}
                onChange={(e, value) => setPositionQuery((prev) => ({ ...prev, pos: value }))}
                placeholder="e.g., 94454459"
                required
              />
            </div>
          )}

          {queryType === "gene" && (
            <div className={styles.formGrid}>
              <Dropdown
                label="Gene Query Type"
                selectedKey={geneQuery.queryType}
                onChange={(e, option) => setGeneQuery((prev) => ({ ...prev, queryType: option.key }))}
                placeholder="Select a query type"
                options={geneQueryOptions}
                required
              />
              <TextField
                label="Value"
                name="value"
                value={geneQuery.value}
                onChange={(e, value) => setGeneQuery((prev) => ({ ...prev, value }))}
                placeholder={geneQuery.queryType === "gene_name" ? "e.g., PLCXD1" : "e.g., 55344"}
                required
              />
            </div>
          )}

          <div className={styles.buttonContainer}>
            <PrimaryButton
              type="submit"
              text={loading ? "Searching..." : "Search"}
              disabled={loading}
              iconProps={{ iconName: "Search" }}
            />
          </div>
        </form>
      </div>

      {error && (
        <MessageBar className={styles.errorMessage} messageBarType={MessageBarType.error} isMultiline={false}>
          {error}
        </MessageBar>
      )}

      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spinner label="Loading results..." />
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className={styles.card}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
              <Text className={styles.subHeader} style={{ margin: 0 }}>
                Results ({results.length} variants found)
              </Text>
              <div className={styles.toggleContainer}>
                <Toggle
                  label="Show Visualizations"
                  checked={showVisualizations}
                  onChange={(e, checked) => setShowVisualizations(checked)}
                  onText="On"
                  offText="Off"
                />
              </div>
            </Stack>
          </div>

          {showVisualizations && (
            <div className={styles.visualizationGrid}>
              {/* Variant Distribution by Chromosome */}
              {chrDistribution.length > 0 && (
                <div className={styles.visualizationCard}>
                  <Text className={styles.subHeader}>Variant Distribution by Chromosome</Text>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chrDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#0078D4" name="Variants" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Amino Acid Change Frequency */}
              {aaChangeFrequency.length > 0 && (
                <div className={styles.visualizationCard}>
                  <Text className={styles.subHeader}>Amino Acid Change Frequency</Text>
                  <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={aaChangeFrequency}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="change" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#107C10" name="Frequency" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Allele Change Type Frequency */}
              {alleleChangeFrequency.length > 0 && (
                <div className={styles.visualizationCard}>
                  <Text className={styles.subHeader}>Allele Change Type Frequency</Text>
                  <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                      <Pie
                        data={alleleChangeFrequency}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="change"
                      >
                        {alleleChangeFrequency.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [value, props.payload.change]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Gene Hotspots */}
              {/* {geneHotspots.length > 0 && (
                <div className={styles.visualizationCard}>
                  <Text className={styles.subHeader}>Gene Mutation Hotspots</Text>
                  <ResponsiveContainer width="100%" height="85%">
                    <ScatterChart>
                      <CartesianGrid />
                      <XAxis type="number" dataKey="position" name="Position" />
                      <YAxis type="number" dataKey="count" name="Variant Count" />
                      <ZAxis type="number" dataKey="size" range={[50, 400]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Legend />
                      <Scatter name="Mutation Hotspots" data={geneHotspots} fill="#E3008C" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              )} */}

             
            </div>
          )}

          {/* Results Table */}
          <div className={styles.card}>
            <Text className={styles.subHeader}>Detailed Results</Text>
            <div className={styles.tableContainer}>
              <div style={{ maxHeight: 600, overflowX: "auto" }}>
                {results.length > 0 && (
                  <table className="fluent-table">
                    <thead className="fluent-table-header">
                      <tr>
                        {Object.keys(results[0])
                          .slice(0, 10)
                          .map((column) => (
                            <th
                              key={column}
                              style={{
                                position: "sticky",
                                top: 0,
                                background: "white",
                                zIndex: 1,
                                fontWeight: "bold",
                                padding: "12px 16px",
                                borderBottom: "1px solid #edebe9",
                              }}
                            >
                              {column}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((record, index) => (
                        <tr
                          key={index}
                          className="fluent-table-row"
                          style={{ backgroundColor: index % 2 === 0 ? "#f3f2f1" : "transparent" }}
                        >
                          {Object.keys(record)
                            .slice(0, 10)
                            .map((column) => {
                              let cellValue = record[column]

                              // Format numeric values if needed
                              if (typeof cellValue === "number" && !Number.isInteger(cellValue)) {
                                cellValue = cellValue.toFixed(3)
                              }

                              return (
                                <td
                                  key={column}
                                  style={{
                                    padding: "8px 16px",
                                    borderBottom: "1px solid #edebe9",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {cellValue?.toString() || "-"}
                                </td>
                              )
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default QueryPage
