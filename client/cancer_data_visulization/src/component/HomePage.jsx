import React, { useState } from 'react';
import VariantInput from '../component/VariantInput';
import ValidationResult from '../component/ValidationResult';
import { validateVariant } from '../services/api';

const HomePage= () => {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleValidate = async (variant, assembly, transcriptSet) => {
    setIsLoading(true);
    setError(null);
    try {
      const validationResult = await validateVariant(variant, assembly, transcriptSet);
      setResult(validationResult);
    } catch (err) {
      setError(err.message || 'An error occurred during validation');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <VariantInput onValidate={handleValidate} isLoading={isLoading} />
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      <ValidationResult result={result} />
    </div>
  );
};

export default HomePage;