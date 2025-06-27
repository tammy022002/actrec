import requests
import json
import urllib.parse
import re
from datetime import datetime

class VariantValidator:
    def __init__(self):
        self.base_url = "https://rest.variantvalidator.org/VariantValidator/variantvalidator_ensembl"
        self.headers = {
            "Accept": "application/json",
            "User-Agent": "EnsemblVariantValidator/1.0"
        }

    def normalize_variant_input(self, variant_input, default_assembly="GRCh38"):
        """Normalize various input formats to the API's expected format"""
        # Remove any whitespace
        variant_input = variant_input.strip()
        
        # Handle HGVS formats
        if re.match(r'^ENST\d+\.\d+:', variant_input):
            return variant_input  # Return as-is for transcript HGVS
        
        # Handle NC_ genomic HGVS
        if re.match(r'^NC_\d+\.\d+:g\.', variant_input):
            return variant_input  # Return as-is for genomic HGVS
        
        # Extract assembly if specified
        assembly = default_assembly
        if '(' in variant_input:
            # Handle formats like chr17(GRCh38):50198002C>A
            match = re.match(r'^(.+?)\((GRCh\d+)\):(.+)$', variant_input)
            if match:
                variant_part = match.group(1) + ':' + match.group(3)
                assembly = match.group(2)
                variant_input = variant_part
        
        # Remove any chr prefix and GRCh38 annotations
        variant_input = re.sub(r'\(GRCh\d+\)', '', variant_input)
        variant_input = re.sub(r'^chr', '', variant_input)
        
        # Handle various genomic formats
        if ':' in variant_input and 'g.' in variant_input:
            # HGVS-like formats: 17:g.50198002C>A
            match = re.match(r'^(\d+):g\.(.+)$', variant_input)
            if match:
                return f"{assembly}-{match.group(1)}-{match.group(2)}"
        
        if ':' in variant_input:
            # VCF-like formats: 17:50198002:C:A or GRCh38:17:50198002:C:A
            parts = variant_input.split(':')
            if len(parts) == 4:
                # GRCh38:17:50198002:C:A or 17:50198002:C:A
                assembly_part = parts[0] if parts[0].startswith('GRCh') else assembly
                return f"{assembly_part}-{parts[1]}-{parts[2]}-{parts[3]}"
            elif len(parts) == 2:
                # 17:50198002C>A
                pos_ref_alt = parts[1]
                # Split into position, ref, alt
                match = re.match(r'^(\d+)([ACGT]+)>([ACGT]+)$', pos_ref_alt)
                if match:
                    return f"{assembly}-{parts[0]}-{match.group(1)}-{match.group(2)}-{match.group(3)}"
        
        if '-' in variant_input and not variant_input.startswith('GRCh'):
            # Pseudo-VCF format: 17-50198002-C-A
            parts = variant_input.split('-')
            if len(parts) == 4:
                return f"{assembly}-{variant_input}"
        
        # If we get here, return the input as-is (will let API handle validation)
        return variant_input

    def validate_variant(self, variant_input, assembly="GRCh38", transcript_set="mane"):
        """Validate variant using the Ensembl-specific endpoint"""
        try:
            normalized_input = self.normalize_variant_input(variant_input, assembly)
            variant_encoded = urllib.parse.quote(normalized_input)
            url = f"{self.base_url}/{assembly}/{variant_encoded}/{transcript_set}?content-type=application%2Fjson"
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status_code": getattr(e.response, 'status_code', None)}

    def format_response(self, api_response):
        """Format the raw API response into a structured output"""
        if not api_response or "error" in api_response:
            error_msg = api_response.get("error", "No results returned from API")
            status_code = api_response.get("status_code", "")
            return f"Error: {error_msg}" + (f" (Status: {status_code})" if status_code else "")

        output = []
        
        # Header with variant and validation status
        output.append(f"Ensembl Variant Validation Report")
        output.append(f"="*80)
        output.append(f"Submitted Variant: {api_response.get('input', {}).get('variant', 'N/A')}")
        output.append(f"Validation Status: {api_response.get('flag', 'N/A').upper()}")
        output.append(f"Validation Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        output.append("")
        
        # HGVS-compliant variant descriptions
        output.append("Ensembl Variant Descriptions")
        output.append("-"*80)
        
        # Transcript-level descriptions
        transcripts = []
        for key, value in api_response.items():
            if key.startswith('ENST') and isinstance(value, dict):
                transcripts.append({
                    'enst_id': key.split(':')[0],
                    'hgvs_cdna': key,
                    'hgvs_protein': value.get('hgvs_protein', 'N/A'),
                    'canonical': value.get('canonical', False),
                    'mane_select': value.get('mane_select', False)
                })
        
        if transcripts:
            output.append(f"{'Type':<20}{'Variant Description':<40}{'Transcript Type'}")
            for transcript in sorted(transcripts, key=lambda x: (not x['mane_select'], not x['canonical'], x['enst_id'])):
                transcript_type = []
                if transcript['mane_select']:
                    transcript_type.append("MANE Select")
                if transcript['canonical']:
                    transcript_type.append("Canonical")
                type_str = ", ".join(transcript_type) if transcript_type else "Other"
                
                output.append(f"{'Transcript (:c.)':<20}{transcript['hgvs_cdna']:<40}{type_str}")
                
                if transcript['hgvs_protein'] != 'N/A':
                    protein_desc = transcript['hgvs_protein']
                    output.append(f"{'Protein (:p.)':<20}{protein_desc:<40}{type_str}")
                    # Add abbreviated protein notation if available
                    if '(' in protein_desc and ')' in protein_desc:
                        abbrev = protein_desc.split('(')[1].split(')')[0]
                        output.append(f"{'Protein (:p.)':<20}{protein_desc.split(':')[0]}:p.{abbrev:<40}{type_str}")
        
        # Genomic Variants
        output.append("\nGenomic Variants")
        output.append("-"*80)
        loci = api_response.get('primary_assembly_loci', {})
        if loci:
            output.append(f"{'Assembly':<10}{'Variant Description':<40}{'VCF Format'}")
            for assembly, data in loci.items():
                if assembly.startswith('grch'):
                    genomic_desc = data.get('hgvs_genomic_description', 'N/A')
                    vcf = data.get('vcf', {})
                    vcf_str = f"{vcf.get('chr', 'N/A')}:{vcf.get('pos', 'N/A')}{vcf.get('ref', 'N/A')}>{vcf.get('alt', 'N/A')}"
                    output.append(f"{assembly.upper():<10}{genomic_desc:<40}{vcf_str}")
        
        # Gene Information
        gene_info = api_response.get('gene_ids', {})
        if gene_info:
            output.append("\nGene Information:")
            output.append("-"*80)
            output.append(f"Symbol: {api_response.get('gene_symbol', 'N/A')}")
            output.append(f"HGNC ID: {gene_info.get('hgnc_id', 'N/A')}")
            output.append(f"Ensembl Gene: {gene_info.get('ensembl_gene_id', 'N/A')}")
        
        # Warnings
        warnings = api_response.get('validation_warnings', [])
        if warnings:
            output.append("\nValidation Warnings:")
            output.append("-"*80)
            for warning in warnings:
                output.append(f"- {warning}")
        
        return "\n".join(output)

def main():
    validator = VariantValidator()
    
    print("Ensembl Variant Validator - Comprehensive Input Support")
    print("="*80)
    print("Supported Input Formats:")
    print("1. HGVS:")
    print("   - ENST00000225964.10:c.589G>T")
    print("   - NC_000017.10:g.48275363C>A")
    print("2. Pseudo-VCF:")
    print("   - 17-50198002-C-A")
    print("   - 17:50198002:C:A")
    print("   - GRCh38-17-50198002-C-A")
    print("   - GRCh38:17:50198002:C:A")
    print("3. Hybrid:")
    print("   - chr17:50198002C>A")
    print("   - chr17:50198002C>A(GRCh38)")
    print("   - chr17(GRCh38):50198002C>A")
    print("   - chr17:g.50198002C>A")
    print("   - chr17:g.50198002C>A(GRCh38)")
    print("   - chr17(GRCh38):g.50198002C>A")
    print("\nEnter 'quit' or 'exit' to end\n")
    
    while True:
        variant = input("\nEnter variant: ").strip()
        if variant.lower() in ('quit', 'exit'):
            break
            
        results = validator.validate_variant(variant)
        formatted_report = validator.format_response(results)
        print(f"\n{formatted_report}")
        
        # Option to save
        save = input("\nSave report to file? (y/n): ").lower()
        if save == 'y':
            # Create a safe filename
            safe_variant = re.sub(r'[^a-zA-Z0-9]', '_', variant)[:50]
            filename = f"ensembl_variant_report_{safe_variant}.txt"
            with open(filename, 'w') as f:
                f.write(formatted_report)
            print(f"Report saved to {filename}")

if __name__ == "__main__":
    main()
