import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-0 py-8 space-y-6 animate-pulse">
      
      {/* 1. Header Skeleton */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
          <div className="w-24 h-24 rounded-full bg-slate-200" />
          <div className="space-y-3 w-full sm:w-48">
            <div className="h-4 bg-slate-200 rounded-md w-1/3" />
            <div className="h-6 bg-slate-200 rounded-md w-3/4" />
            <div className="h-4 bg-slate-200 rounded-md w-1/2" />
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto justify-center md:justify-end">
          <div className="w-24 h-16 bg-slate-100 rounded-2xl" />
          <div className="w-24 h-16 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* 2. Top grid row: Completion + Status level + Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 h-64 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 bg-slate-200 rounded-md w-1/2" />
            <div className="h-3 bg-slate-200 rounded-md w-5/6" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded-md w-full" />
            <div className="h-3.5 bg-slate-200 rounded-md w-1/4" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 h-64 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 bg-slate-200 rounded-md w-1/2" />
            <div className="h-3 bg-slate-200 rounded-md w-5/6" />
          </div>
          <div className="h-16 bg-slate-100 rounded-2xl" />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 h-64 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 bg-slate-200 rounded-md w-1/2" />
            <div className="h-3 bg-slate-200 rounded-md w-5/6" />
          </div>
          <div className="space-y-3">
            <div className="h-1.5 bg-slate-200 rounded-md w-full" />
            <div className="h-1.5 bg-slate-200 rounded-md w-full" />
            <div className="h-1.5 bg-slate-200 rounded-md w-full" />
          </div>
        </div>
      </div>

      {/* 3. Middle grid row: Statistics (Large block) + Earnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-105 shadow-sm lg:col-span-2 space-y-4">
          <div className="h-5 bg-slate-200 rounded-md w-1/4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="h-16 bg-slate-100 rounded-2xl" />
            <div className="h-16 bg-slate-100 rounded-2xl" />
            <div className="h-16 bg-slate-100 rounded-2xl" />
            <div className="h-16 bg-slate-100 rounded-2xl" />
          </div>
          <div className="h-36 bg-slate-50 rounded-2xl" />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 h-80 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="h-5 bg-slate-200 rounded-md w-1/2" />
            <div className="h-3 bg-slate-200 rounded-md w-5/6" />
          </div>
          <div className="space-y-2">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>

    </div>
  );
}
