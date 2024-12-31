import React, { useState } from 'react';
import { usePatient } from '../../hooks/usePatients';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  AlertCircle,
  FileBarChart,
  ClipboardList,
  Share2,
  Printer,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

interface Report {
  id: string;
  title: string;
  type: 'progress' | 'exercise' | 'medical' | 'summary';
  date: Date;
  doctor: string;
  status: 'new' | 'viewed' | 'shared';
  size: string;
  downloadUrl: string;
}

const Reports = () => {
  const { loading, error } = usePatient();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');

  // Mock data - replace with real data from backend
  const reports: Report[] = [
    {
      id: '1',
      title: 'Monthly Progress Report - January 2024',
      type: 'progress',
      date: new Date('2024-01-31'),
      doctor: 'Dr. Sarah Wilson',
      status: 'new',
      size: '2.4 MB',
      downloadUrl: '#'
    },
    {
      id: '2',
      title: 'Exercise Performance Analysis',
      type: 'exercise',
      date: new Date('2024-01-28'),
      doctor: 'Dr. Sarah Wilson',
      status: 'viewed',
      size: '1.8 MB',
      downloadUrl: '#'
    },
    {
      id: '3',
      title: 'Medical Assessment Report',
      type: 'medical',
      date: new Date('2024-01-25'),
      doctor: 'Dr. Michael Chen',
      status: 'shared',
      size: '3.2 MB',
      downloadUrl: '#'
    },
    {
      id: '4',
      title: 'Weekly Summary Report',
      type: 'summary',
      date: new Date('2024-01-21'),
      doctor: 'Dr. Sarah Wilson',
      status: 'viewed',
      size: '1.5 MB',
      downloadUrl: '#'
    }
  ];

  const reportTypes = [
    { value: 'all', label: 'All Reports' },
    { value: 'progress', label: 'Progress Reports' },
    { value: 'exercise', label: 'Exercise Reports' },
    { value: 'medical', label: 'Medical Reports' },
    { value: 'summary', label: 'Summary Reports' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'text-blue-600 bg-blue-100';
      case 'viewed':
        return 'text-gray-600 bg-gray-100';
      case 'shared':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <FileBarChart className="w-5 h-5" />;
      case 'exercise':
        return <ClipboardList className="w-5 h-5" />;
      case 'medical':
        return <FileText className="w-5 h-5" />;
      case 'summary':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const filteredReports = reports
    .filter(report => selectedType === 'all' || report.type === selectedType)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return b.date.getTime() - a.date.getTime();
      }
      return a.type.localeCompare(b.type);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">{error}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
              <p className="text-gray-600">View and download your rehabilitation reports</p>
            </div>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-5 h-5 mr-2" />
              Download All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {reportTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date">Sort by Date</option>
                  <option value="type">Sort by Type</option>
                </select>
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Total Reports: {filteredReports.length}</span>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${
                    report.type === 'progress' ? 'bg-blue-100 text-blue-600' :
                    report.type === 'exercise' ? 'bg-green-100 text-green-600' :
                    report.type === 'medical' ? 'bg-purple-100 text-purple-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {getTypeIcon(report.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span>{report.doctor}</span>
                      <span>•</span>
                      <span>{format(report.date, 'MMM d, yyyy')}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports; 