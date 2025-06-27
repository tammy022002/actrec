import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Button, 
  Box, 
  Typography, 
  Paper,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  IconButton,
  CircularProgress
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import { getExamples } from '../services/api';

const VariantInput = ({ onValidate, isLoading }) => {
  const [variant, setVariant] = useState('');
  const [assembly, setAssembly] = useState('GRCh38');
  const [transcriptSet, setTranscriptSet] = useState('mane');
  const [examples, setExamples] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const loadExamples = async () => {
      try {
        const data = await getExamples();
        setExamples(data);
      } catch (error) {
        console.error('Error loading examples:', error);
      }
    };
    loadExamples();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!variant.trim()) return;
    onValidate(variant, assembly, transcriptSet);
  };

  const commonInputProps = {
    variant: 'outlined',
    fullWidth: true,
    size: 'small',
    margin: 'dense'
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Variant Validator</Typography>
        <Tooltip title="Show help">
          <IconButton onClick={() => setShowHelp(!showHelp)} size="small">
            <HelpOutline fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {showHelp && (
        <Box sx={{ 
          bgcolor: 'background.default', 
          p: 1, 
          mb: 2, 
          borderRadius: 1,
          fontSize: '0.8rem'
        }}>
          <Typography variant="body2">
            Enter variants in HGVS format. Examples:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
            <li><code>NM_000546.6:c.797G&gt;T</code></li>
            <li><code>NC_000017.11:g.7674252C&gt;A</code></li>
          </Box>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Autocomplete
          freeSolo
          options={examples}
          value={variant}
          onChange={(_, newValue) => setVariant(newValue || '')}
          onInputChange={(_, newInputValue) => setVariant(newInputValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              {...commonInputProps}
              label="Variant (HGVS format)"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {isLoading && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
        />

        <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5 }}>
          <Select
            value={assembly}
            onChange={(e) => setAssembly(e.target.value)}
            {...commonInputProps}
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="GRCh38">GRCh38</MenuItem>
            <MenuItem value="GRCh37">GRCh37</MenuItem>
          </Select>

          <Select
            value={transcriptSet}
            onChange={(e) => setTranscriptSet(e.target.value)}
            {...commonInputProps}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="mane">MANE Select</MenuItem>
            <MenuItem value="refseq">RefSeq</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </Box>

        <Button
          type="submit"
          variant="contained"
          disabled={isLoading || !variant.trim()}
          sx={{ mt: 2 }}
          fullWidth
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
        >
          Validate Variant
        </Button>
      </form>
    </Paper>
  );
};

export default VariantInput;