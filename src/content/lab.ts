export type Provenance = 'original' | 'reconstructed';

export interface Demo {
  id: string;
  name: string;
  principle: string;
  what: string;
  provenance: Provenance;
  provenanceShort: string;
  provenanceLong: string;
  relatedSlug?: string;
  status: 'in-build';
}

export const demos: Demo[] = [
  {
    id: 'brand-voice-agent',
    name: 'Brand Voice Agent',
    principle: 'A brand voice is a specification. If it is written precisely, it can be tested.',
    what: 'Paste any draft and see every rule it breaks, then generate new copy in the voice and watch it pass the same checks.',
    provenance: 'original',
    provenanceShort: 'Built from my original Claude skill, shown with a sample brand.',
    provenanceLong:
      'Based on a Claude skill I wrote and use with Canva to produce designs. The rules and structure are the original; the brand is a neutral sample, and the web interface is new for this site.',
    status: 'in-build',
  },
  {
    id: 'ai-fit-check',
    name: 'AI Fit Check',
    principle: 'Decide whether AI belongs in a workflow before deciding how to build it.',
    what: 'Rate a use case on the cost of a wrong answer, how easily output can be checked, how specialized the domain is and whether a person reviews it. Get a recommendation: deploy, pilot with review, or do not deploy.',
    provenance: 'reconstructed',
    provenanceShort: 'Formalized for this site after the GGU project.',
    provenanceLong:
      'A framework I formalized for this portfolio after the Golden Gate University project, drawing on the factors from that evaluation. It was not a tool used during the pilot.',
    relatedSlug: 'ggu-edvisor-ai',
    status: 'in-build',
  },
  {
    id: 'cubscore',
    name: 'CubScore, explained',
    principle: 'A recommendation people cannot inspect is one they cannot trust.',
    what: 'Adjust what matters to you, from cost to career prospects, and watch programs re-rank, with the reason for every score shown.',
    provenance: 'reconstructed',
    provenanceShort: 'Rebuilt for this site with illustrative data.',
    provenanceLong:
      'A reconstruction of the 2016 CubScore concept. The four factors come from the original design; the programs, weights and figures are illustrative and labelled as such.',
    relatedSlug: 'cub-financial',
    status: 'in-build',
  },
];
