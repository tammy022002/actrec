"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts"
import axios from "axios"

// Custom colors for charts
const COLORS = [
  "#8884d8",
  "#83a6ed",
  "#8dd1e1",
  "#82ca9d",
  "#a4de6c",
  "#d0ed57",
  "#ffc658",
  "#ff8042",
  "#ff6361",
  "#bc5090",
  "#58508d",
  "#003f5c",
  "#444e86",
  "#955196",
  "#dd5182",
  "#ff6e54",
  "#ffa600",
]

const Analysis = () => {
  // State variables for different visualizations
  const [chromosomeData, setChromsomeData] = useState([])
  const [aminoAcidData, setAminoAcidData] = useState([])
  const [alleleChangeData, setAlleleChangeData] = useState([])
  const [geneVariantData, setGeneVariantData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for search inputs
  const [chromosome, setChromosome] = useState("")
  const [position, setPosition] = useState("")
  const [searchResults, setSearchResults] = useState([])

  // State for amino acid change inputs
  const [aaRef, setAaRef] = useState("")
  const [aaAlt, setAaAlt] = useState("")

  // State for allele change inputs
  const [ref, setRef] = useState("")
  const [alt, setAlt] = useState("")

  // State for gene-specific analysis
  const [selectedGene, setSelectedGene] = useState("")
  const [geneSpecificData, setGeneSpecificData] = useState([])

  // State for chart type selection
  const [chromosomeChartType, setChromosomeChartType] = useState("bar")

  // Fetch initial data on component mount
  useEffect(() => {
    fetchChromosomeData()
    fetchTopGenes()
  }, [])

  // Fetch chromosome distribution data
  const fetchChromosomeData = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:8088/api/chromosome-distribution")
      setChromsomeData(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching chromosome data:", err)
      setError("Failed to load chromosome distribution data")
      setLoading(false)
    }
  }

  // Fetch amino acid change data
  const fetchAminoAcidData = async () => {
    try {
      setLoading(true)
      const response = await axios.post("http://localhost:8088/api/amino-acid-changes", {
        aaref: aaRef,
        aaalt: aaAlt,
      })
      setAminoAcidData(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching amino acid data:", err)
      setError("Failed to load amino acid change data")
      setLoading(false)
    }
  }

  // Fetch allele change data
  const fetchAlleleChangeData = async () => {
    try {
      setLoading(true)
      const response = await axios.post("http://localhost:8088/api/allele-changes", {
        ref: ref,
        alt: alt,
      })
      setAlleleChangeData(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching allele change data:", err)
      setError("Failed to load allele change data")
      setLoading(false)
    }
  }

  // Search variants by chromosome and position
  const searchVariants = async () => {
    if (!chromosome) {
      setError("Chromosome is required")
      return
    }

    try {
      setLoading(true)
      const response = await axios.post("http://localhost:8088/api/query/position", {
        chr: chromosome,
        pos: position || undefined,
      })
      setSearchResults(response.data.results || [])
      setLoading(false)
    } catch (err) {
      console.error("Error searching variants:", err)
      setError("Failed to search variants")
      setLoading(false)
    }
  }

  // Fetch top genes with most variants
  const fetchTopGenes = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:8088/api/top-genes")
      setGeneVariantData(response.data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching top genes:", err)
      setError("Failed to load top genes data")
      setLoading(false)
    }
  }

  // Fetch gene-specific analysis
  const fetchGeneSpecificData = async () => {
    if (!selectedGene) {
      setError("Please select a gene")
      return
    }

    try {
      setLoading(true)
      const response = await axios.post("http://localhost:8088/api/query/gene", {
        queryType: "gene_name",
        value: selectedGene,
      })
      setGeneSpecificData(response.data.results || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching gene-specific data:", err)
      setError("Failed to load gene-specific data")
      setLoading(false)
    }
  }

  // Custom tooltip for chromosome chart
  const ChromosomeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "10px", border: "1px solid #ccc" }}>
          <p className="label">{`Chromosome: ${payload[0].name}`}</p>
          <p className="intro">{`Variants: ${payload[0].value}`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="analysis p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Genetic Data Analysis</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Variant Distribution by Chromosome */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Variant Distribution by Chromosome</h2>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${chromosomeChartType === "bar" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setChromosomeChartType("bar")}
            >
              Bar
            </button>
            <button
              className={`px-3 py-1 rounded ${chromosomeChartType === "pie" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setChromosomeChartType("pie")}
            >
              Pie
            </button>
          </div>
        </div>

        {loading && chromosomeData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chromosomeChartType === "bar" ? (
                <BarChart data={chromosomeData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="chromosome" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip content={<ChromosomeTooltip />} />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Variants" />
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={chromosomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="chromosome"
                    label={({ chromosome, count, percent }) =>
                      `${chromosome}: ${count} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {chromosomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Amino Acid Change Frequency */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Amino Acid Change Frequency</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Amino Acid</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., A"
              value={aaRef}
              onChange={(e) => setAaRef(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Altered Amino Acid</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., V"
              value={aaAlt}
              onChange={(e) => setAaAlt(e.target.value)}
            />
          </div>
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
          onClick={fetchAminoAcidData}
        >
          Analyze
        </button>

        {loading && aminoAcidData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : aminoAcidData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis type="category" dataKey="aaref" name="Reference" allowDuplicatedCategory={false} />
                <YAxis type="category" dataKey="aaalt" name="Alteration" allowDuplicatedCategory={false} />
                <ZAxis type="number" dataKey="count" range={[50, 400]} name="Frequency" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Legend />
                <Scatter name="Amino Acid Changes" data={aminoAcidData} fill="#8884d8" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Enter reference and altered amino acids to see frequency data
          </div>
        )}
      </div>

      {/* Allele Change Type Frequency */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Allele Change Type Frequency</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference Nucleotide</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., A"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Altered Nucleotide</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., T"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
            />
          </div>
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
          onClick={fetchAlleleChangeData}
        >
          Analyze
        </button>

        {loading && alleleChangeData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : alleleChangeData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alleleChangeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="change" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Enter reference and altered nucleotides to see frequency data
          </div>
        )}
      </div>

      {/* Search by Chromosome and Position */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Search Variants by Location</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chromosome</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 7"
              value={chromosome}
              onChange={(e) => setChromosome(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Position (optional)</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 55259515"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
        </div>

        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md mb-4" onClick={searchVariants}>
          Search
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chr
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ref
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gene
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AA Change
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.slice(0, 10).map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{result.chr}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result["pos(1-based)"] || result.pos_1_based}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.ref}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.alt}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{result.genename}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {result.aaref && result.aaalt ? `${result.aaref}>${result.aaalt}` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {searchResults.length > 10 && (
              <div className="text-center text-gray-500 mt-4">Showing 10 of {searchResults.length} results</div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            Enter chromosome and optional position to search for variants
          </div>
        )}
      </div>

      {/* Gene-Specific Analysis */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Gene-Specific Analysis</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Gene</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedGene}
              onChange={(e) => setSelectedGene(e.target.value)}
            >
              <option value="">Select a gene</option>
              {geneVariantData.map((gene, index) => (
                <option key={index} value={gene.name}>
                  {gene.name} ({gene.count} variants)
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              onClick={fetchGeneSpecificData}
            >
              Analyze Gene
            </button>
          </div>
        </div>

        {loading && geneSpecificData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : geneSpecificData.length > 0 ? (
          <div>
            <h3 className="text-lg font-medium mb-2">Mutation Distribution in {selectedGene}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={geneSpecificData
                    .reduce((acc, item) => {
                      const position = item.aapos
                      const existing = acc.find((x) => x.position === position)
                      if (existing) {
                        existing.count += 1
                      } else if (position) {
                        acc.push({ position, count: 1 })
                      }
                      return acc
                    }, [])
                    .sort((a, b) => a.position - b.position)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="position"
                    label={{ value: "Amino Acid Position", position: "insideBottom", offset: -5 }}
                  />
                  <YAxis label={{ value: "Variant Count", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#ff7300" name="Mutations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">Select a gene to see mutation distribution</div>
        )}
      </div>

      {/* Top Genes with Most Variants */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Top Genes with Most Variants</h2>

        {loading && geneVariantData.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geneVariantData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Variants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analysis
