import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { FaDollarSign, FaChartLine, FaReceipt, FaUsers, FaCreditCard, FaPiggyBank } from 'react-icons/fa';

const FinanceDashboard = () => {
  const { user } = useAuth();

  const financialStats = [
    {
      title: 'Total Revenue',
      value: '$125,678',
      change: '+18%',
      changeType: 'positive',
      icon: FaDollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Expenses',
      value: '$89,432',
      change: '+5%',
      changeType: 'negative',
      icon: FaReceipt,
      color: 'bg-red-500'
    },
    {
      title: 'Net Profit',
      value: '$36,246',
      change: '+25%',
      changeType: 'positive',
      icon: FaChartLine,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Accounts',
      value: '156',
      change: '+12%',
      changeType: 'positive',
      icon: FaUsers,
      color: 'bg-purple-500'
    }
  ];

  const recentTransactions = [
    { id: '#TXN-001', description: 'Product Sales', amount: '$2,450', type: 'Income', date: '2024-01-15' },
    { id: '#TXN-002', description: 'Office Supplies', amount: '-$180', type: 'Expense', date: '2024-01-14' },
    { id: '#TXN-003', description: 'Service Revenue', amount: '$1,200', type: 'Income', date: '2024-01-13' },
    { id: '#TXN-004', description: 'Equipment Purchase', amount: '-$850', type: 'Expense', date: '2024-01-12' },
    { id: '#TXN-005', description: 'Consulting Fee', amount: '$3,500', type: 'Income', date: '2024-01-11' }
  ];

  const budgetOverview = [
    { category: 'Marketing', budget: '$15,000', spent: '$12,450', remaining: '$2,550', percentage: 83 },
    { category: 'Operations', budget: '$25,000', spent: '$18,200', remaining: '$6,800', percentage: 73 },
    { category: 'Development', budget: '$30,000', spent: '$22,100', remaining: '$7,900', percentage: 74 },
    { category: 'Administration', budget: '$10,000', spent: '$8,750', remaining: '$1,250', percentage: 88 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.firstName} {user?.lastName}! Here's your financial overview.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financialStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Budget Overview</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {budgetOverview.map((budget, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                      <span className="text-sm text-gray-600">
                        ${budget.spent.replace('$', '')} / ${budget.budget.replace('$', '')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${budget.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">Spent: {budget.percentage}%</span>
                      <span className="text-xs text-green-600">Remaining: {budget.remaining}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                        {transaction.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaReceipt className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Create Invoice</h3>
                <p className="text-gray-600">Generate new invoices</p>
              </div>
            </div>
            <button className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              New Invoice
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaCreditCard className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Expense Report</h3>
                <p className="text-gray-600">Track expenses</p>
              </div>
            </div>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              View Expenses
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaPiggyBank className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Financial Reports</h3>
                <p className="text-gray-600">Generate reports</p>
              </div>
            </div>
            <button className="mt-4 w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
