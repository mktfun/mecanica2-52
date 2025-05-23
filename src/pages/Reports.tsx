import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LeadsReports from '@/components/reports/LeadsReports';
import SalesReports from '@/components/reports/SalesReports';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('leads');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="sales">Vendas</TabsTrigger>
            </TabsList>
            <TabsContent value="leads">
              <LeadsReports />
            </TabsContent>
            <TabsContent value="sales">
              <SalesReports />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
