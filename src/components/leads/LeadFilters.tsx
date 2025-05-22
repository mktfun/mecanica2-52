
import { ChangeEvent, FormEvent, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FilterX } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export interface LeadFilters {
  source: string;
  dateFrom: string;
  dateTo: string;
  service: string;
  searchText: string;
}

interface LeadFiltersProps {
  filters: LeadFilters;
  onFilterChange: (filters: LeadFilters) => void;
  onClearFilters: () => void;
}

const LeadFilters = ({ filters, onFilterChange, onClearFilters }: LeadFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<LeadFilters>(filters);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof LeadFilters, value: string) => {
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      source: '',
      dateFrom: '',
      dateTo: '',
      service: '',
      searchText: ''
    };
    setLocalFilters(emptyFilters);
    onClearFilters();
  };
  
  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              name="searchText"
              value={localFilters.searchText}
              onChange={handleInputChange}
              placeholder="Buscar leads..."
              className="max-w-sm"
            />
            <Button type="submit" size="sm">Buscar</Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Menos filtros' : 'Mais filtros'}
            </Button>
            
            {Object.values(filters).some(val => val !== '') && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={handleClearFilters}
              >
                <FilterX className="w-4 h-4 mr-1" /> 
                Limpar filtros
              </Button>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="source">Fonte</Label>
              <Select
                value={localFilters.source}
                onValueChange={(value) => handleSelectChange('source', value)}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Todas as fontes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as fontes</SelectItem>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="meta_ads">Meta Ads</SelectItem>
                  <SelectItem value="referral">Indicação</SelectItem>
                  <SelectItem value="organic">Orgânico</SelectItem>
                  <SelectItem value="direct">Direto</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service">Serviço</Label>
              <Select
                value={localFilters.service}
                onValueChange={(value) => handleSelectChange('service', value)}
              >
                <SelectTrigger id="service">
                  <SelectValue placeholder="Todos os serviços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os serviços</SelectItem>
                  <SelectItem value="revisao">Revisão</SelectItem>
                  <SelectItem value="troca_oleo">Troca de Óleo</SelectItem>
                  <SelectItem value="freios">Freios</SelectItem>
                  <SelectItem value="suspensao">Suspensão</SelectItem>
                  <SelectItem value="motor">Motor</SelectItem>
                  <SelectItem value="eletrica">Elétrica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Data Início</Label>
              <Input
                id="dateFrom"
                name="dateFrom"
                type="date"
                value={localFilters.dateFrom}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateTo">Data Fim</Label>
              <Input
                id="dateTo"
                name="dateTo"
                type="date"
                value={localFilters.dateTo}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};

export default LeadFilters;
