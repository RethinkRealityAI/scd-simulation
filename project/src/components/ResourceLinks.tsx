import React from 'react';
import { ExternalLink, BookOpen } from 'lucide-react';

interface ResourceLink {
  title: string;
  url: string;
  description: string;
}

interface ResourceLinksProps {
  resources?: ResourceLink[];
}

const ResourceLinks: React.FC<ResourceLinksProps> = ({ 
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
    <div className="p-3 rounded-xl bg-amber-500/10 backdrop-blur-xl border border-amber-400/20 shadow-lg">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-amber-400" />
        Continue Your Learning
      </h3>
      
      <div className="space-y-2">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${resource.title} in new tab`}
            className="block p-3 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 hover:border-amber-400/40 transition-all duration-300 transform hover:scale-[1.02] group focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50"
          >
            <div className="flex items-start gap-2 mb-1">
              <ExternalLink className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5 group-hover:text-amber-300 transition-colors" />
              <h4 className="text-white font-semibold text-xs leading-tight group-hover:text-amber-100 transition-colors">
                {resource.title}
              </h4>
            </div>
            <p className="text-gray-300 text-xs leading-tight group-hover:text-gray-200 transition-colors pl-5">
              {resource.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ResourceLinks;
