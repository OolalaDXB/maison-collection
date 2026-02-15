import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Download } from "lucide-react";
import AdminImportTab from "@/components/admin/AdminImportTab";
import AdminExportTab from "@/components/admin/AdminExportTab";

const AdminImportPage = () => {
  return (
    <AdminLayout>
      <h1 className="font-display text-2xl mb-6">Import / Export</h1>
      <Tabs defaultValue="import">
        <TabsList>
          <TabsTrigger value="import" className="gap-2">
            <Upload size={14} /> Import
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Download size={14} /> Export
          </TabsTrigger>
        </TabsList>
        <TabsContent value="import" className="mt-6">
          <AdminImportTab />
        </TabsContent>
        <TabsContent value="export" className="mt-6">
          <AdminExportTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminImportPage;
