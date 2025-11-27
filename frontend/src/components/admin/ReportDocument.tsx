import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { Report } from '@/types';

// Register a font that supports a wider range of characters if needed
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
// });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    // fontFamily: 'Roboto', // Use registered font
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
  },
  reportItem: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  reportDetail: {
    fontSize: 10,
    marginBottom: 3,
  },
  label: {
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: 'grey',
  },
  table: {
    // @ts-expect-error '@react-pdf/renderer' aceita 'table' em runtime, mas o tipo não inclui esse valor
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '20%', // Adjust as needed, ensure total is 100%
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '20%', // Adjust as needed
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 8,
    textAlign: 'left',
  },
});

interface ReportDocumentProps {
  reports: Report[];
  filters: {
    startDate?: string;
    endDate?: string;
    category?: string;
    status?: string;
  };
}

const ReportDocument: React.FC<ReportDocumentProps> = ({ reports, filters }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Relatório de Denúncias Ambientais</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filtros Aplicados</Text>
        {filters.startDate && <Text style={styles.reportDetail}><Text style={styles.label}>Data Inicial:</Text> {new Date(filters.startDate + 'T00:00:00').toLocaleDateString()}</Text>}
        {filters.endDate && <Text style={styles.reportDetail}><Text style={styles.label}>Data Final:</Text> {new Date(filters.endDate + 'T23:59:59').toLocaleDateString()}</Text>}
        {filters.category && filters.category !== 'all' && <Text style={styles.reportDetail}><Text style={styles.label}>Categoria:</Text> {filters.category}</Text>}
        {filters.status && filters.status !== 'all' && <Text style={styles.reportDetail}><Text style={styles.label}>Status:</Text> {filters.status}</Text>}
        {(filters.category === 'all' || !filters.category) && <Text style={styles.reportDetail}><Text style={styles.label}>Categoria:</Text> Todas</Text>}
        {(filters.status === 'all' || !filters.status) && <Text style={styles.reportDetail}><Text style={styles.label}>Status:</Text> Todos</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalhes das Denúncias ({reports.length})</Text>
        
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableRow}>
            <View style={[styles.tableColHeader, {width: '15%'}]}><Text style={styles.headerText}>Data/Hora</Text></View>
            <View style={[styles.tableColHeader, {width: '15%'}]}><Text style={styles.headerText}>Categoria</Text></View>
            <View style={[styles.tableColHeader, {width: '10%'}]}><Text style={styles.headerText}>Status</Text></View>
            <View style={[styles.tableColHeader, {width: '30%'}]}><Text style={styles.headerText}>Descrição</Text></View>
            <View style={[styles.tableColHeader, {width: '15%'}]}><Text style={styles.headerText}>Localização</Text></View>
            <View style={[styles.tableColHeader, {width: '15%'}]}><Text style={styles.headerText}>Usuário</Text></View>
          </View>
          {/* Table Body */}
          {reports.map((report) => (
            <View key={report.id} style={styles.tableRow}>
              <View style={[styles.tableCol, {width: '15%'}]}><Text style={styles.cellText}>{report.timestamp}</Text></View>
              <View style={[styles.tableCol, {width: '15%'}]}><Text style={styles.cellText}>{report.category}</Text></View>
              <View style={[styles.tableCol, {width: '10%'}]}><Text style={styles.cellText}>{report.status || 'N/A'}</Text></View>
              <View style={[styles.tableCol, {width: '30%'}]}><Text style={styles.cellText}>{report.description.substring(0,100)}{report.description.length > 100 ? '...' : ''}</Text></View>
              <View style={[styles.tableCol, {width: '15%'}]}><Text style={styles.cellText}>{
                typeof report.location === 'object' 
                ? `Lat: ${report.location.latitude.toFixed(5)}, Lon: ${report.location.longitude.toFixed(5)}` 
                : report.location || 'N/A'
              }</Text></View>
              <View style={[styles.tableCol, {width: '15%'}]}><Text style={styles.cellText}>{
                report.userInfo?.name || report.userInfo?.email 
                ? `${report.userInfo.name || ''} (${report.userInfo.email || ''})` 
                : 'Anônimo'
              }</Text></View>
            </View>
          ))}
        </View>
        {reports.length === 0 && <Text style={styles.reportDetail}>Nenhuma denúncia encontrada com os filtros selecionados.</Text>}
      </View>

      <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default ReportDocument;

// Make sure to export the Report interface from AdminDashboard.tsx or define it here if not already.
// Example: if AdminDashboard.tsx has `export interface Report { ... }`
// If not, you might need to duplicate or move the Report interface definition to a shared types file.
