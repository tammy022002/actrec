import React, { useState } from 'react';
import {
  Paper, Typography, Box, Button, Divider,
  Table, TableBody, TableCell, TableRow,
  Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

// Helper function to remove version from ENST ID
const removeVersionFromENST = (transcriptId) => {
  return transcriptId.replace(/(ENST\d+)\.\d+/, '$1');
};

const buildMergedData = (raw) => {
  const result = {
    'Variant Description': raw?.input || '',
    Gene: '',
    HGNC_ID: '',
    Transcripts: [],
    Protein_Changes: [],
  };

  // Collect all transcript keys in their full format (ENST...:c...)
  const transcriptKeys = Object.keys(raw).filter((key) => 
    key.includes(':') && key.startsWith('ENST')
  );

  for (const key of transcriptKeys) {
    const data = raw[key];

    result.Gene = data.gene_symbol || result.Gene;
    result.HGNC_ID = data.gene_ids?.hgnc_id || result.HGNC_ID;

    // Remove version from ENST ID but keep the rest
    const transcriptWithoutVersion = removeVersionFromENST(key);
    result.Transcripts.push(transcriptWithoutVersion);

    const protein = data.hgvs_predicted_protein_consequence?.tlr;
    if (protein && !result.Protein_Changes.includes(protein)) {
      result.Protein_Changes.push(protein);
    }
  }

  // Join with comma and space for better readability
  result.Transcripts = result.Transcripts.join(', ');
  result.Protein_Changes = result.Protein_Changes.join(', ');

  return result;
};

const ValidationResult = ({ result, onSave }) => {
  const [selectedTranscript, setSelectedTranscript] = useState('');

  if (!result) return null;

  const { raw, formatted } = result;
  const variantDescription = raw?.input || '';

  const validTranscriptKeys = Object.keys(raw).filter((key) =>
    key.includes(':') && key.startsWith('ENST')
  );

  const handleTranscriptChange = (event) => {
    setSelectedTranscript(event.target.value);
  };

  const selectedData = raw[selectedTranscript];

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Validation Results</Typography>
        <Button variant="outlined" onClick={onSave} disabled={!formatted}>
          Save Report
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Summary Table */}
      <Table>
        <TableBody>
          {Object.entries(buildMergedData(raw)).map(([key, value], idx) => (
            <TableRow key={idx}>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>{key}</TableCell>
              <TableCell>
                {key === 'Variant Description' ? (
                  <Box component="code" sx={{ fontFamily: 'monospace' }}>
                    {value}
                  </Box>
                ) : (
                  <Typography variant="body1">{value}</Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Divider sx={{ my: 3 }} />

      {/* Transcript Selection */}
      {validTranscriptKeys.length > 0 && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Transcript</InputLabel>
            <Select 
              value={selectedTranscript} 
              onChange={handleTranscriptChange} 
              label="Select Transcript"
            >
              {validTranscriptKeys.map((key) => {
                const displayText = removeVersionFromENST(key);
                return (
                  <MenuItem key={key} value={key}>
                    {displayText}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Transcript Details */}
          {selectedTranscript && selectedData && (
            <Box sx={{ mb: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Details for: <code>{removeVersionFromENST(selectedTranscript)}</code>
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ width: '30%' }}><strong>Variant Description</strong></TableCell>
                    <TableCell>
                      <Box component="code" sx={{ fontFamily: 'monospace' }}>
                        {variantDescription}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Gene Symbol</strong></TableCell>
                    <TableCell>{selectedData.gene_symbol}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Gene ID</strong></TableCell>
                    <TableCell>{selectedData.gene_ids?.entrez_gene_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>HGNC ID</strong></TableCell>
                    <TableCell>{selectedData.gene_ids?.hgnc_id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Protein Consequence</strong></TableCell>
                    <TableCell>
                      {selectedData.hgvs_predicted_protein_consequence?.tlr}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Transcript Description</strong></TableCell>
                    <TableCell>{selectedData.transcript_description}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Genomic Description (GRCh38)</strong></TableCell>
                    <TableCell>
                      {selectedData.primary_assembly_loci?.grch38?.hgvs_genomic_description}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Validation Warnings</strong></TableCell>
                    <TableCell>
                      {(selectedData.validation_warnings || []).map((w, i) => (
                        <Typography key={i} variant="body2">- {w}</Typography>
                      ))}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

export default ValidationResult;