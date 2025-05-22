import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { enhancedLeadsStore } from "@/core/storage/StorageService";
import { Lead, LeadStatus } from "@/types/lead";
import LeadDetailModal from './LeadDetailModal';
import { useStorageData } from '@/hooks/useStorageData';

const ITEMS_PER_PAGE = 10;

const LEAD_STATUS_MAP: Record<LeadStatus, { label: string, variant: "default" | "outline" | "secondary" | "destructive" }> = {
  'new': { label: 'Novo', variant: 'outline' },
  'contacted': { label: 'Contatado', variant: 'outline' },
  'negotiation': { label: 'Em Negociação', variant: 'secondary' },
  'scheduled': { label: 'Agendado', variant: 'secondary' },
  'converted': { label: 'Convertido', variant: 'default' },
  'lost': { label: 'Perdido', variant: 'destructive' }
};

const LeadList = () => {
  // Usar hook de dados com atualização automática
  const leads = useStorageData<Lead>(enhancedLeadsStore);
  
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getSourceOptions = useMemo(() => {
    // Extract all unique sources from leads, making sure none are empty strings
    const sourcesSet = new Set<string>();
    
    leads.forEach(lead => {
      // Make sure we don't add empty strings to our sources list
      const source = lead.source?.trim() || "Desconhecido";
      if (source) {
        sourcesSet.add(source);
      }
    });
    
    return Array.from(sourcesSet);
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Filter by status
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      
      // Filter by source
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;
      
      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          lead.name.toLowerCase().includes(query) ||
          lead.phone.toLowerCase().includes(query) ||
          (lead.email && lead.email.toLowerCase().includes(query))
        );
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by selected field
      let aValue = a[sortBy as keyof Lead];
      let bValue = b[sortBy as keyof Lead];
      
      // Convert to number for potential value
      if (sortBy === 'potential_value') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }
      
      // Sort
      if (aValue < bValue) return sortDir === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, statusFilter, sourceFilter, searchQuery, sortBy, sortDir]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 md:gap-4">
        <div className="w-full md:w-auto flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, telefone ou email..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        
        <div className="w-full sm:w-auto flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                {Object.keys(LEAD_STATUS_MAP).map((status) => (
                  <SelectItem key={status} value={status}>
                    {LEAD_STATUS_MAP[status as LeadStatus].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select
            value={sourceFilter}
            onValueChange={(value) => {
              setSourceFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Fonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Fontes</SelectItem>
              {getSourceOptions.length > 0 ? (
                getSourceOptions.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-sources">Sem fontes</SelectItem>
              )}
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(value) => handleSort(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Data de criação</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="potential_value">Valor potencial</SelectItem>
              <SelectItem value="status_changed_at">Última atualização</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          >
            {sortDir === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Carregando leads...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Potencial</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
                      Nenhum lead encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLeads.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewLead(lead)}
                    >
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>
                        <div>{lead.phone}</div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                      </TableCell>
                      <TableCell>
                        {lead.vehicle_brand} {lead.vehicle_model} ({lead.vehicle_year})
                      </TableCell>
                      <TableCell>{lead.service_interest || "N/A"}</TableCell>
                      <TableCell>{lead.source || "Desconhecido"}</TableCell>
                      <TableCell>
                        <Badge variant={LEAD_STATUS_MAP[lead.status]?.variant || 'outline'}>
                          {LEAD_STATUS_MAP[lead.status]?.label || lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(lead.potential_value)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {isDetailModalOpen && selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
        />
      )}
    </div>
  );
};

export default LeadList;
