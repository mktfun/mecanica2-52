
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

// Dados mockados de campanhas
const mockCampaigns = [
  {
    id: '1',
    name: 'Manutenção Preventiva',
    platform: 'google_ads',
    status: 'active',
    budget: 30.00,
    spend: 824.50,
    impressions: 15600,
    clicks: 780,
    ctr: 5.0,
    leads: 39,
    cpl: 21.14,
    performance: 'good'
  },
  {
    id: '2',
    name: 'Troca de Óleo Promocional',
    platform: 'meta_ads',
    status: 'active',
    budget: 25.00,
    spend: 625.00,
    impressions: 12000,
    clicks: 540,
    ctr: 4.5,
    leads: 27,
    cpl: 23.15,
    performance: 'good'
  },
  {
    id: '3',
    name: 'Alinhamento e Balanceamento',
    platform: 'google_ads',
    status: 'active',
    budget: 20.00,
    spend: 580.00,
    impressions: 8900,
    clicks: 320,
    ctr: 3.6,
    leads: 18,
    cpl: 32.22,
    performance: 'average'
  },
  {
    id: '4',
    name: 'Revisão para Viagem',
    platform: 'meta_ads',
    status: 'paused',
    budget: 15.00,
    spend: 225.50,
    impressions: 5400,
    clicks: 210,
    ctr: 3.9,
    leads: 8,
    cpl: 28.19,
    performance: 'average'
  },
  {
    id: '5',
    name: 'Diagnóstico Gratuito',
    platform: 'google_ads',
    status: 'active',
    budget: 35.00,
    spend: 980.00,
    impressions: 18500,
    clicks: 920,
    ctr: 4.97,
    leads: 42,
    cpl: 23.33,
    performance: 'good'
  },
  {
    id: '6',
    name: 'Ar Condicionado - Verão',
    platform: 'meta_ads',
    status: 'paused',
    budget: 18.00,
    spend: 198.00,
    impressions: 3800,
    clicks: 95,
    ctr: 2.5,
    leads: 4,
    cpl: 49.50,
    performance: 'poor'
  }
];

export const MarketingCampaigns = () => {
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    return (
      (filterPlatform === 'all' || campaign.platform === filterPlatform) &&
      (filterStatus === 'all' || campaign.status === filterStatus) &&
      (searchTerm === '' || campaign.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleExportCSV = () => {
    toast.success('Relatório de campanhas exportado em CSV');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Campanhas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex w-full md:w-1/2">
              <Input
                placeholder="Pesquisar campanhas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              <Search className="relative w-4 h-4 -ml-8 mt-3 text-gray-400" />
            </div>
            
            <div className="flex flex-1 gap-4">
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Plataformas</SelectItem>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="meta_ads">Meta Ads</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Orçamento/dia</TableHead>
                <TableHead className="text-right">Gasto</TableHead>
                <TableHead className="text-right">Impressões</TableHead>
                <TableHead className="text-right">Cliques</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Leads</TableHead>
                <TableHead className="text-right">CPL</TableHead>
                <TableHead>Desemp.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {campaign.platform === 'google_ads' ? (
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      ) : (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      )}
                      {campaign.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`${
                        campaign.status === 'active' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-orange-100 text-orange-800 border-orange-200'
                      }`}
                    >
                      {campaign.status === 'active' ? 'Ativo' : 'Pausado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">R$ {campaign.budget.toFixed(2)}</TableCell>
                  <TableCell className="text-right">R$ {campaign.spend.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{campaign.impressions.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
                  <TableCell className="text-right">{campaign.leads}</TableCell>
                  <TableCell className="text-right">R$ {campaign.cpl.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span 
                        className={`w-2 h-2 rounded-full mr-2 ${
                          campaign.performance === 'good' 
                            ? 'bg-green-500' 
                            : campaign.performance === 'average'
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="sr-only">{campaign.performance}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-between mt-4">
            <p className="text-sm text-gray-500">Exibindo {filteredCampaigns.length} de {mockCampaigns.length} campanhas</p>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleExportCSV}>Exportar CSV</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
