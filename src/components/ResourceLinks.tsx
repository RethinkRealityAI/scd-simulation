import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

interface ResourceLink {
  title: string;
  url: string;
  description: string;
}

interface ResourceLinksProps {
  resources?: ResourceLink[];
  /** Compact mode hides descriptions and tightens padding — for narrow panel use */
  compact?: boolean;
}

const ResourceLinks: React.FC<ResourceLinksProps> = ({
  compact = false,
  resources = [
    {
      title: 'Sickle Cell Disease: Pathophysiology and Treatment',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3172721/',
      description: 'Comprehensive review of SCD mechanisms and therapeutic approaches'
    },
    {
      title: 'Emergency Management of Vaso-Occlusive Crisis',
      url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4938685/',
      description: 'Evidence-based guidelines for acute crisis management'
    },
    {
      title: 'Cultural Competency in Sickle Cell Care',
      url: 'https://bmcemergmed.biomedcentral.com/articles/10.1186/s12873-025-01192-1',
      description: 'Addressing bias and improving patient outcomes through cultural awareness'
    }
  ]
}) => {
  return (
    <div className={`rounded-xl bg-amber-500/10 backdrop-blur-xl border border-amber-400/20 shadow-lg ${compact ? 'p-2.5' : 'p-3'}`}>
      <h3 className={`font-semibold text-white flex items-center gap-1.5 ${compact ? 'text-xs mb-2' : 'text-sm mb-3'}`}>
        <BookOpen className={`text-amber-400 flex-shrink-0 ${compact ? 'w-3 h-3' : 'w-4 h-4'}`} />
        Continue Your Learning
      </h3>

      <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${resource.title} in new tab`}
            className={`block rounded-lg bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 hover:border-amber-400/40
              transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50
              ${compact ? 'p-2' : 'p-3 transform hover:scale-[1.02]'}`}
          >
            <div className="flex items-start gap-1.5">
              <ExternalLink className={`text-amber-400 flex-shrink-0 mt-0.5 group-hover:text-amber-300 transition-colors ${compact ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
              <h4 className={`text-white font-semibold leading-snug group-hover:text-amber-100 transition-colors ${compact ? 'text-[11px]' : 'text-xs'}`}>
                {resource.title}
              </h4>
            </div>
            {!compact && (
              <p className="text-gray-300 text-xs leading-tight group-hover:text-gray-200 transition-colors pl-5 mt-1">
                {resource.description}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ResourceLinks;

