
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PerformanceMetricsProps {
  googleData: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    ctr: number;
    cpc: number;
    cpl: number;
  };
  metaData: {
    spend: number;
    impressions: number;
    clicks: number;
    leads: number;
    ctr: number;
    cpc: number;
    cpl: number;
  };
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ googleData, metaData }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de Desempenho</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métrica</TableHead>
              <TableHead className="text-right">Google Ads</TableHead>
              <TableHead className="text-right">Meta Ads</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Investimento</TableCell>
              <TableCell className="text-right">R$ {googleData.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right">R$ {metaData.spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
              <TableCell className="text-right font-medium">R$ {(googleData.spend + metaData.spend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Impressões</TableCell>
              <TableCell className="text-right">{googleData.impressions.toLocaleString('pt-BR')}</TableCell>
              <TableCell className="text-right">{metaData.impressions.toLocaleString('pt-BR')}</TableCell>
              <TableCell className="text-right font-medium">{(googleData.impressions + metaData.impressions).toLocaleString('pt-BR')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Cliques</TableCell>
              <TableCell className="text-right">{googleData.clicks.toLocaleString('pt-BR')}</TableCell>
              <TableCell className="text-right">{metaData.clicks.toLocaleString('pt-BR')}</TableCell>
              <TableCell className="text-right font-medium">{(googleData.clicks + metaData.clicks).toLocaleString('pt-BR')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Leads</TableCell>
              <TableCell className="text-right">{googleData.leads}</TableCell>
              <TableCell className="text-right">{metaData.leads}</TableCell>
              <TableCell className="text-right font-medium">{googleData.leads + metaData.leads}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CTR</TableCell>
              <TableCell className="text-right">{googleData.ctr.toFixed(2)}%</TableCell>
              <TableCell className="text-right">{metaData.ctr.toFixed(2)}%</TableCell>
              <TableCell className="text-right font-medium">
                {(((googleData.clicks + metaData.clicks) / (googleData.impressions + metaData.impressions)) * 100).toFixed(2)}%
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CPC</TableCell>
              <TableCell className="text-right">R$ {googleData.cpc.toFixed(2)}</TableCell>
              <TableCell className="text-right">R$ {metaData.cpc.toFixed(2)}</TableCell>
              <TableCell className="text-right font-medium">
                R$ {((googleData.spend + metaData.spend) / (googleData.clicks + metaData.clicks)).toFixed(2)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">CPL</TableCell>
              <TableCell className="text-right">R$ {googleData.cpl.toFixed(2)}</TableCell>
              <TableCell className="text-right">R$ {metaData.cpl.toFixed(2)}</TableCell>
              <TableCell className="text-right font-medium">
                R$ {((googleData.spend + metaData.spend) / (googleData.leads + metaData.leads)).toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
