
import React from 'react';
import { Users } from 'lucide-react';

interface LeadData {
  id: string;
  name: string;
  created_at: string;
  status: string;
}

interface NewLeadsCardProps {
  data: LeadData[];
}

const NewLeadsCard = ({ data }: NewLeadsCardProps) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const newLeads = data.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= oneWeekAgo;
  });

  return (
    <div className="p-4 h-full flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {newLeads.length}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          novos leads esta semana
        </p>
      </div>
    </div>
  );
};

export default NewLeadsCard;
