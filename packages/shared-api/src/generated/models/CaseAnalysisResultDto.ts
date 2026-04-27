/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DefendantPositionDto } from './DefendantPositionDto';
import type { EvidenceMapItemDto } from './EvidenceMapItemDto';
import type { PotentialLegalCharacterizationDto } from './PotentialLegalCharacterizationDto';
export type CaseAnalysisResultDto = {
    case_type?: string | null;
    case_number?: string | null;
    court_name?: string | null;
    legal_facts_summary?: Array<string> | null;
    opposing_parties_positions?: Array<DefendantPositionDto> | null;
    evidence_map?: Array<EvidenceMapItemDto> | null;
    legal_and_technical_review_points?: Array<string> | null;
    potential_legal_characterization?: PotentialLegalCharacterizationDto;
};

