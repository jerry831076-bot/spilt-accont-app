import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Calendar, 
  Receipt, 
  Calculator, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Cake, 
  User, 
  UserCheck, 
  UserX, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  ShieldAlert,
  Info,
  Pencil,
  AlertTriangle,
  HardDrive, // 新增：用於資料管理圖示
  Download, // 新增：用於匯出圖示
  Upload, // 新增：用於匯入圖示
  Copy, // 新增：用於複製圖示
  Settings // 新增：用於新導航入口
} from 'lucide-react';

// --- Mock Data & Storage Helper ---

const generateId = () => Math.random().toString(36).substr(2, 9);

const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

// --- Shared Components ---

// Custom Confirmation Modal (Replaces window.confirm)
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600 mb-3">
            <AlertTriangle size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{message}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition shadow-lg shadow-red-200"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

export default function SplitBillApp() {
  // 將 DataManagement 設為新的 Tab 選項
  const [activeTab, setActiveTab] = useState('activities'); 
  const [currentActivityId, setCurrentActivityId] = useState(null);

  const [users, setUsers] = useStickyState([], 'split-bill-users');
  const [activities, setActivities] = useStickyState([], 'split-bill-activities');
  const [expenses, setExpenses] = useStickyState([], 'split-bill-expenses');

  const currentActivity = activities.find(a => a.id === currentActivityId);

  const handleTabChange = (tab) => {
    if (tab === 'activities') {
      setCurrentActivityId(null);
    }
    setActiveTab(tab);
  };

  const handleBackToActivities = () => {
    setCurrentActivityId(null);
    setActiveTab('activities');
  };
  
  // 提供給 DataManagementView 的 Setter Functions
  const resetAllData = () => {
    setUsers([]);
    setActivities([]);
    setExpenses([]);
  };

  const importAllData = (data) => {
    setUsers(data.users || []);
    setActivities(data.activities || []);
    setExpenses(data.expenses || []);
  };

  // 匯出 App 所有資料
  const exportData = {
    users,
    activities,
    expenses,
    version: '1.0.0'
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md z-10">
        <div className="flex items-center justify-between max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 overflow-hidden">
             {currentActivityId ? (
               <button onClick={handleBackToActivities} className="mr-1 p-1 hover:bg-blue-700 rounded">
                 <ChevronLeft size={24} />
               </button>
             ) : null}

             <h1 className="text-xl font-bold flex items-center gap-2 truncate">
               {activeTab === 'personnel' && <><Users size={24} /> 人員管理</>}
               {activeTab === 'data' && <><Settings size={24} /> 資料管理</>}
               {activeTab === 'activities' && !currentActivityId && <><Calendar size={24} /> 活動列表</>}
               {(activeTab === 'expenses' || activeTab === 'settlement') && currentActivity && (
                 <div className="flex flex-col overflow-hidden">
                   <span className="text-xs opacity-80 font-normal leading-none mb-0.5">目前活動</span>
                   <span className="text-lg font-bold truncate">{currentActivity.title}</span>
                 </div>
               )}
             </h1>
          </div>

          {currentActivityId && (activeTab === 'expenses' || activeTab === 'settlement') && (
            <div className="flex bg-blue-700 rounded-lg p-1 text-xs font-medium shrink-0 ml-2">
              <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-3 py-1 rounded ${activeTab === 'expenses' ? 'bg-white text-blue-700 shadow' : 'text-blue-100'}`}
              >
                收支
              </button>
              <button 
                onClick={() => setActiveTab('settlement')}
                className={`px-3 py-1 rounded ${activeTab === 'settlement' ? 'bg-white text-blue-700 shadow' : 'text-blue-100'}`}
              >
                分帳
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-md mx-auto w-full pb-20">
          
          {activeTab === 'personnel' && (
            <PersonnelView users={users} setUsers={setUsers} />
          )}

          {activeTab === 'activities' && !currentActivityId && (
            <ActivitiesView 
              activities={activities} 
              setActivities={setActivities} 
              setExpenses={setExpenses}
              expenses={expenses}
              users={users}
              onSelectActivity={(id) => {
                setCurrentActivityId(id);
                setActiveTab('expenses');
              }}
            />
          )}
          
          {activeTab === 'data' && (
            <DataManagementView 
              data={exportData} 
              resetAllData={resetAllData} 
              importAllData={importAllData} 
              users={users} 
              activities={activities} 
              expenses={expenses}
            />
          )}

          {activeTab === 'expenses' && currentActivity && (
            <ExpensesView 
              activity={currentActivity}
              expenses={expenses.filter(e => e.activityId === currentActivity.id)}
              setExpenses={setExpenses}
              allExpenses={expenses}
              users={users}
            />
          )}

          {activeTab === 'settlement' && currentActivity && (
            <SettlementView 
              activity={currentActivity}
              setActivities={setActivities}
              expenses={expenses.filter(e => e.activityId === currentActivity.id)}
              users={users}
            />
          )}

        </div>
      </main>

      {/* Persistent Bottom Navigation - 新增 Data Management Tab */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full z-10">
        <div className="max-w-md mx-auto grid grid-cols-3 h-16">
          <button 
            onClick={() => handleTabChange('personnel')}
            className={`flex flex-col items-center justify-center ${activeTab === 'personnel' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Users size={24} />
            <span className="text-xs mt-1">人員</span>
          </button>
          <button 
            onClick={() => handleTabChange('activities')}
            className={`flex flex-col items-center justify-center ${['activities', 'expenses', 'settlement'].includes(activeTab) ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1">活動</span>
          </button>
          <button 
            onClick={() => handleTabChange('data')}
            className={`flex flex-col items-center justify-center ${activeTab === 'data' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Settings size={24} />
            <span className="text-xs mt-1">資料</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

// --- Sub-Component: Data Management View (NEW) ---

function DataManagementView({ data, resetAllData, importAllData, users, activities, expenses }) {
  const [importText, setImportText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  
  const [copied, setCopied] = useState(false);
  
  // Helper to escape CSV strings
  const csvEscape = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value).replace(/"/g, '""'); // Escape double quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str}"`; // Enclose if special chars exist
    }
    return str;
  };

  // 匯出所有資料到 JSON (用於 App 之間轉移)
  const handleExportJson = () => {
    const jsonString = JSON.stringify(data);
    
    // 複製到剪貼簿 (在手機上最方便)
    navigator.clipboard.writeText(jsonString).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        alert('JSON 資料已複製到剪貼簿。請將其貼到新的 App 中匯入。');
    }).catch(err => {
        console.error('Copy failed: ', err);
        // 如果複製失敗，提供下載連結
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `split_bill_data_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
  };

  // 匯出所有費用到 CSV (用於 Google Sheet 或 Excel)
  const handleExportCsv = () => {
    const header = [
      '活動名稱', 
      '費用項目', 
      '金額', 
      '付款人', 
      '分攤人數', 
      '排除外賓', 
      '排除壽星', 
      '紀錄日期'
    ].join(',');

    const rows = expenses.map(e => {
      const activity = activities.find(a => a.id === e.activityId);
      const payer = users.find(u => u.id === e.payerId);

      return [
        csvEscape(activity?.title || '未知活動'),
        csvEscape(e.title),
        e.amount,
        csvEscape(payer?.name || '未知人員'),
        e.beneficiaryIds.length,
        e.excludeOutsiders ? '是' : '否',
        e.excludeBirthday ? '是' : '否',
        new Date(e.date).toLocaleDateString()
      ].join(',');
    });

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' }); // Add BOM for Chinese encoding
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `split_bill_expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // 匯入 JSON 資料
  const handleImport = () => {
    try {
      const importedData = JSON.parse(importText);
      if (importedData.users && importedData.activities && importedData.expenses) {
        if (!confirm('確認覆蓋資料？\n\n匯入將會清除當前 App 中的所有資料，並替換為匯入的內容。')) return;
        importAllData(importedData);
        alert('資料匯入成功！App 已更新。');
        setShowImportModal(false);
        setImportText('');
      } else {
        throw new Error('資料結構不完整。');
      }
    } catch (error) {
      alert(`資料匯入失敗：請檢查貼上的內容是否為完整的 JSON 格式。\n錯誤訊息: ${error.message}`);
    }
  };
  
  const handleReset = () => {
      resetAllData();
      setConfirmResetOpen(false);
      alert('所有資料已成功清除！');
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 flex items-start gap-3">
        <Info size={20} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold mb-1">總資料摘要:</p>
          <p>活動數: **{activities.length}** | 人員數: **{users.length}** | 支出筆數: **{expenses.length}**</p>
        </div>
      </div>
      
      {/* 匯出區塊 */}
      <h2 className="text-xl font-bold border-b pb-2">資料匯出 (備份)</h2>
      <div className="space-y-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3"><HardDrive size={24} className="text-blue-500" /><div className='flex-1'>
                <div className="font-medium">匯出 JSON 檔案/文字</div>
                <div className="text-xs text-gray-500">用於**跨裝置轉移**所有 App 資料 (人員/活動/支出)。</div>
            </div></div>
            <button 
                onClick={handleExportJson} 
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
                {copied ? <Check size={18} /> : <Copy size={18} />} 
                {copied ? '已複製到剪貼簿' : '複製 JSON 資料'}
            </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3"><Download size={24} className="text-green-600" /><div className='flex-1'>
                <div className="font-medium">匯出 CSV 檔案 (.csv)</div>
                <div className="text-xs text-gray-500">用於**電腦保存備份**或上傳至 Google Sheet/Excel。</div>
            </div></div>
            <button 
                onClick={handleExportCsv} 
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition"
            >
                <Download size={18} /> 下載 CSV 備份
            </button>
        </div>
      </div>
      
      {/* 匯入區塊 */}
      <h2 className="text-xl font-bold border-b pb-2 pt-4">資料匯入 (還原/轉移)</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3"><Upload size={24} className="text-orange-500" /><div className='flex-1'>
            <div className="font-medium">匯入 JSON 資料</div>
            <div className="text-xs text-gray-500">將匯出的 JSON 文字貼上，還原所有 App 資料。</div>
        </div></div>
        <button 
            onClick={() => setShowImportModal(true)} 
            className="w-full sm:w-auto px-4 py-2 bg-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-orange-600 transition"
        >
            <Upload size={18} /> 貼上並匯入
        </button>
      </div>

      {/* 清除資料區塊 */}
      <h2 className="text-xl font-bold border-b pb-2 pt-4">資料清除</h2>
      <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3"><Trash2 size={24} className="text-red-500" /><div className='flex-1'>
            <div className="font-medium">清除所有資料</div>
            <div className="text-xs text-gray-500">永久清除所有人員、活動及支出紀錄。</div>
        </div></div>
        <button 
            onClick={() => setConfirmResetOpen(true)} 
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-700 transition"
        >
            <Trash2 size={18} /> 重置所有資料
        </button>
      </div>


      {/* 匯入彈窗 */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">匯入 JSON 資料 (會覆蓋現有資料)</h2>
            <textarea 
              placeholder="請貼上完整的 JSON 匯出文字..." 
              className="w-full h-40 p-3 border rounded-lg text-sm resize-none outline-none focus:ring-2 focus:ring-orange-500 mb-4" 
              value={importText} 
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowImportModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-700">取消</button>
              <button onClick={handleImport} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium" disabled={!importText.trim()}>確認匯入</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 重置確認彈窗 */}
      <ConfirmModal 
        isOpen={confirmResetOpen}
        title="警告：清除所有資料"
        message="這將永久清除所有人員、活動和支出紀錄，且無法復原。請確認您已備份 JSON 資料。"
        onConfirm={handleReset}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}


// --- Sub-Component: Personnel View (No changes) ---
function PersonnelView({ users, setUsers }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIsOutsider, setNewIsOutsider] = useState(false);
  
  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const handleAddUser = () => {
    if (!newName.trim()) return;
    const newUser = {
      id: generateId(),
      name: newName,
      isOutsider: newIsOutsider,
      avatar: `https://ui-avatars.com/api/?name=${newName}&background=random&color=fff`
    };
    setUsers([...users, newUser]);
    setNewName('');
    setNewIsOutsider(false);
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    if(confirmDeleteId) {
      setUsers(users.filter(u => u.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const toggleOutsider = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, isOutsider: !u.isOutsider } : u));
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">
        <p className="flex items-start gap-2">
          <Info size={16} className="mt-1 shrink-0" />
          <span>在此建立成員。「外賓」標記用於在分帳時快速排除非核心成員。</span>
        </p>
      </div>
      {users.length === 0 && <div className="text-center py-10 text-gray-400">目前沒有人員，請點擊下方按鈕新增。</div>}
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
              <div>
                <div className="font-medium text-lg">{user.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  {user.isOutsider ? (
                    <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded flex items-center gap-1"><UserX size={12} /> 外賓 (標記)</span>
                  ) : (
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><UserCheck size={12} /> 核心成員</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <button onClick={() => toggleOutsider(user.id)} className={`p-2 rounded-full transition ${user.isOutsider ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`} title="切換外賓標記">{user.isOutsider ? <ShieldAlert size={20} /> : <User size={20} />}</button>
              <button onClick={() => setConfirmDeleteId(user.id)} className="p-2 text-gray-400 hover:text-red-500 transition"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition z-20"><Plus size={28} /></button>
      
      {/* Confirm Delete User Modal */}
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="刪除人員"
        message="確定要刪除此人員嗎？如果他已經在活動中有帳務，刪除可能會導致資料錯誤。"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">新增人員</h2>
            <input autoFocus type="text" placeholder="姓名" className="w-full p-3 border rounded-lg mb-4 text-lg outline-none focus:ring-2 focus:ring-blue-500" value={newName} onChange={e => setNewName(e.target.value)} />
            <label className="flex items-center gap-3 p-3 border rounded-lg mb-6 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" checked={newIsOutsider} onChange={e => setNewIsOutsider(e.target.checked)} />
              <div><div className="font-medium">標記為「外賓」</div><div className="text-xs text-gray-500">不分擔內部/壽星費用</div></div>
            </label>
            <div className="flex gap-3"><button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-700">取消</button><button onClick={handleAddUser} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">確認新增</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Component: Activities View (Fixed in previous step) ---

function ActivitiesView({ activities, setActivities, users, onSelectActivity, setExpenses, expenses }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); 
  
  const [newTitle, setNewTitle] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState([]);
  const [selectedBirthdayIds, setSelectedBirthdayIds] = useState([]);

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    if (isModalOpen && step === 1) {
      const coreIds = users.filter(u => !u.isOutsider).map(u => u.id);
      setSelectedParticipantIds(coreIds);
      setSelectedBirthdayIds([]); 
    }
  }, [isModalOpen, step, users]);

  const handleCreateActivity = () => {
    if (!newTitle.trim()) return;
    const settlementStatus = {};
    selectedParticipantIds.forEach(id => { settlementStatus[id] = false; });
    const newActivity = {
      id: generateId(),
      title: newTitle,
      date: new Date().toLocaleDateString(),
      participants: selectedParticipantIds,
      birthdayPersonIds: selectedBirthdayIds,
      settlementStatus: settlementStatus,
      isFullySettled: false
    };
    setActivities([newActivity, ...activities]);
    setNewTitle('');
    setSelectedParticipantIds([]);
    setSelectedBirthdayIds([]);
    setStep(1);
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    if (confirmDeleteId) {
      setActivities(activities.filter(a => a.id !== confirmDeleteId));
      setExpenses(expenses.filter(e => e.activityId !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const toggleParticipant = (id) => {
    if (selectedParticipantIds.includes(id)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(pid => pid !== id));
      if (selectedBirthdayIds.includes(id)) setSelectedBirthdayIds(selectedBirthdayIds.filter(bid => bid !== id));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, id]);
    }
  };

  const toggleBirthday = (id) => {
    if (selectedBirthdayIds.includes(id)) {
      setSelectedBirthdayIds(selectedBirthdayIds.filter(bid => bid !== id));
    } else {
      setSelectedBirthdayIds([...selectedBirthdayIds, id]);
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 && <div className="text-center py-10 text-gray-400">尚無活動，開始你的第一次分帳吧！</div>}
      {activities.map(activity => {
        const birthdayIds = activity.birthdayPersonIds || (activity.birthdayPersonId ? [activity.birthdayPersonId] : []);
        const birthdayNames = users.filter(u => birthdayIds.includes(u.id)).map(u => u.name).join(', ');
        
        // 修正: 即時計算該活動的總支出，確保列表顯示正確金額
        const activityExpenses = expenses.filter(e => e.activityId === activity.id);
        const realTotalExpense = activityExpenses.reduce((sum, e) => sum + e.amount, 0);

        return (
          <div key={activity.id} onClick={() => onSelectActivity(activity.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <div><h3 className="text-lg font-bold text-gray-800">{activity.title}</h3><span className="text-xs text-gray-500">{activity.date}</span></div>
              <div className="flex items-center gap-2">
                {activity.isFullySettled ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Check size={12} /> 已結案</span> : <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"><Info size={12} /> 未結清</span>}
                {/* Delete Button: Changed to use custom modal state */}
                <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(activity.id); }} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition z-10"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="flex items-center gap-2">
                {birthdayNames && <div className="flex items-center gap-1 text-xs bg-pink-50 text-pink-600 px-2 py-1 rounded-lg max-w-[150px] truncate"><Cake size={14} /><span className="font-medium">壽星: {birthdayNames}</span></div>}
                <div className="text-xs text-gray-400">{activity.participants.length} 人參與</div>
              </div>
              {/* 這裡使用即時計算的 realTotalExpense */}
              <div className="text-xl font-bold text-blue-600">${realTotalExpense.toLocaleString()}</div>
            </div>
          </div>
        );
      })}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-20 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition z-20"><Plus size={28} /></button>
      
      {/* Confirm Delete Activity Modal */}
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="刪除活動"
        message="確定要刪除整個活動嗎？所有相關的記帳資料也會一併刪除，無法復原。"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">新增活動 {step === 1 ? '(1/2)' : '(2/2)'}</h2>
            {step === 1 ? (
              <>
                <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">活動名稱</label><input autoFocus type="text" placeholder="e.g., 11月宜蘭行" className="w-full p-3 border rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500" value={newTitle} onChange={e => setNewTitle(e.target.value)} /></div>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">選擇參與人員</label><div className="grid grid-cols-2 gap-2">{users.map(user => (
                      <div key={user.id} onClick={() => toggleParticipant(user.id)} className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition ${selectedParticipantIds.includes(user.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedParticipantIds.includes(user.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>{selectedParticipantIds.includes(user.id) && <Check size={12} className="text-white" />}</div><span className="text-sm truncate">{user.name}</span>{user.isOutsider && <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded">外賓</span>}</div>
                    ))}</div></div>
                <div className="flex gap-3"><button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-700">取消</button><button onClick={() => { if(!newTitle) return alert('請輸入名稱'); if(selectedParticipantIds.length === 0) return alert('請至少選擇一人'); setStep(2); }} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">下一步</button></div>
              </>
            ) : (
              <>
                <div className="mb-6"><label className="block text-sm font-medium text-gray-700 mb-2">誰是本次壽星？(可複選)</label><p className="text-xs text-gray-500 mb-3">選定後，在收支頁面可以一鍵排除壽星的費用分擔。</p><div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">{users.filter(u => selectedParticipantIds.includes(u.id)).map(user => { const isBirthday = selectedBirthdayIds.includes(user.id); return (<div key={user.id} onClick={() => toggleBirthday(user.id)} className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition ${isBirthday ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${isBirthday ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`}>{isBirthday && <Check size={12} className="text-white" />}</div><span className="text-sm truncate flex items-center gap-1">{user.name} {isBirthday && '🎂'}</span></div>); })}</div></div>
                <div className="flex gap-3"><button onClick={() => setStep(1)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-700">上一步</button><button onClick={handleCreateActivity} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">建立活動</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Component: Expenses View (No changes) ---

function ExpensesView({ activity, expenses, setExpenses, allExpenses, users }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payerId, setPayerId] = useState('');
  const [beneficiaryIds, setBeneficiaryIds] = useState([]);
  
  // Quick Filters State
  const [excludeOutsiders, setExcludeOutsiders] = useState(false);
  const [excludeBirthday, setExcludeBirthday] = useState(false);

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Helper: Get all birthday IDs 
  const birthdayIds = useMemo(() => 
    activity.birthdayPersonIds || (activity.birthdayPersonId ? [activity.birthdayPersonId] : []), 
  [activity]);

  const participants = users.filter(u => activity.participants.includes(u.id));

  // Open Modal for Create (Initialize Defaults)
  const openCreateModal = () => {
    setEditingExpenseId(null);
    setTitle('');
    setAmount('');
    if (participants.length > 0) setPayerId(participants[0].id);
    setBeneficiaryIds(activity.participants);
    setExcludeOutsiders(false);
    setExcludeBirthday(false);
    setIsModalOpen(true);
  };

  // Open Modal for Edit (Load Data)
  const openEditModal = (expense) => {
    setEditingExpenseId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setPayerId(expense.payerId);
    setBeneficiaryIds(expense.beneficiaryIds);
    setExcludeOutsiders(expense.excludeOutsiders || false);
    setExcludeBirthday(expense.excludeBirthday || false);
    setIsModalOpen(true);
  };
  
  const handleFilterChange = (type, checked) => {
      if (type === 'outsider') {
          setExcludeOutsiders(checked);
          updateBeneficiaries(checked, excludeBirthday); 
      } else {
          setExcludeBirthday(checked);
          updateBeneficiaries(excludeOutsiders, checked);
      }
  };

  const updateBeneficiaries = (noOutsider, noBirthday) => {
      let targetIds = activity.participants;
      if (noOutsider) {
        const outsiderIds = users.filter(u => u.isOutsider).map(u => u.id);
        targetIds = targetIds.filter(id => !outsiderIds.includes(id));
      }
      if (noBirthday && birthdayIds.length > 0) {
        targetIds = targetIds.filter(id => !birthdayIds.includes(id));
      }
      setBeneficiaryIds(targetIds);
  };

  const handleSaveExpense = () => {
    if (!title || !amount || !payerId || beneficiaryIds.length === 0) return;

    const expenseData = {
      id: editingExpenseId || generateId(),
      activityId: activity.id,
      title,
      amount: parseFloat(amount),
      payerId,
      beneficiaryIds,
      excludeOutsiders,
      excludeBirthday,
      date: new Date().toISOString()
    };

    let updatedExpenses;
    if (editingExpenseId) {
        updatedExpenses = allExpenses.map(e => e.id === editingExpenseId ? expenseData : e);
    } else {
        updatedExpenses = [...allExpenses, expenseData];
    }
    
    setExpenses(updatedExpenses);
    setIsModalOpen(false);
  };

  const executeDelete = () => {
      if(confirmDeleteId) {
        const updatedExpenses = allExpenses.filter(e => e.id !== confirmDeleteId);
        setExpenses(updatedExpenses);
        setConfirmDeleteId(null);
      }
  };

  const toggleBeneficiary = (id) => {
    if (beneficiaryIds.includes(id)) {
      setBeneficiaryIds(beneficiaryIds.filter(bid => bid !== id));
    } else {
      setBeneficiaryIds([...beneficiaryIds, id]);
    }
  };

  const birthdayNames = users.filter(u => birthdayIds.includes(u.id)).map(u => u.name).join(', ');

  return (
    <div className="space-y-4">
       <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="text-sm text-gray-500 mb-1">目前總支出</div>
          <div className="text-3xl font-bold text-blue-600">${expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</div>
          {birthdayNames && <div className="mt-2 text-xs text-pink-600 bg-pink-50 inline-block px-2 py-1 rounded">🎂 壽星: {birthdayNames}</div>}
       </div>

      <div className="space-y-3 pb-20">
        {expenses.map(expense => {
          const payer = users.find(u => u.id === expense.payerId);
          return (
            <div key={expense.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm group">
              <div className="flex-1 cursor-pointer" onClick={() => openEditModal(expense)}>
                <div className="font-medium text-gray-900 flex items-center gap-2">
                    {expense.title} 
                    <Pencil size={12} className="text-gray-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition" />
                </div>
                <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1"><User size={10} /> {payer?.name} 先付</span>
                  {expense.excludeOutsiders && <span className="bg-orange-100 text-orange-700 px-1.5 rounded flex items-center gap-1"><ShieldAlert size={10} /> 外賓不列入</span>}
                  {expense.excludeBirthday && <span className="bg-pink-100 text-pink-700 px-1.5 rounded flex items-center gap-1"><Cake size={10} /> 壽星不付</span>}
                </div>
              </div>
              <div className="text-right pl-4">
                <div className="font-bold text-gray-900">${expense.amount.toLocaleString()}</div>
                <div className="flex items-center justify-end gap-2">
                    <div className="text-xs text-gray-400">{expense.beneficiaryIds.length} 人分擔</div>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(expense.id); }} className="p-1 text-gray-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={openCreateModal} className="fixed bottom-20 right-6 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition z-20"><Plus size={28} /></button>
      
      {/* Confirm Delete Expense Modal */}
      <ConfirmModal 
        isOpen={!!confirmDeleteId}
        title="刪除支出"
        message="確定要刪除這筆消費紀錄嗎？"
        onConfirm={executeDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto flex flex-col">
            <h2 className="text-xl font-bold mb-4">{editingExpenseId ? '編輯支出' : '新增支出'}</h2>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1"><label className="text-xs text-gray-500 block mb-1">金額</label><input autoFocus type="number" placeholder="0" className="w-full p-3 border rounded-lg text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" value={amount} onChange={e => setAmount(e.target.value)} /></div>
              <div className="flex-[2]"><label className="text-xs text-gray-500 block mb-1">項目名稱</label><input type="text" placeholder="e.g., 晚餐" className="w-full p-3 border rounded-lg text-lg outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={e => setTitle(e.target.value)} /></div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-gray-500 block mb-1">誰先付錢？</label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {participants.map(u => (
                  <button key={u.id} onClick={() => setPayerId(u.id)} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap border ${payerId === u.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>{u.name}</button>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between items-center mb-2"><label className="text-xs text-gray-500">分給誰？({beneficiaryIds.length}人)</label></div>
              
              <div className="flex gap-2 mb-3">
                <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${excludeOutsiders ? 'bg-orange-50 border-orange-300 text-orange-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                   <input type="checkbox" className="hidden" checked={excludeOutsiders} onChange={e => handleFilterChange('outsider', e.target.checked)} />
                   <ShieldAlert size={16} /> 外賓不列入
                </label>
                {birthdayIds.length > 0 && (
                  <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition ${excludeBirthday ? 'bg-pink-50 border-pink-300 text-pink-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                    <input type="checkbox" className="hidden" checked={excludeBirthday} onChange={e => handleFilterChange('birthday', e.target.checked)} />
                    <Cake size={16} /> 壽星不付
                  </label>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {participants.map(u => {
                  const isSelected = beneficiaryIds.includes(u.id);
                  return (
                    <div key={u.id} onClick={() => toggleParticipant(u.id)} className={`flex flex-col items-center cursor-pointer transition ${isSelected ? 'opacity-100' : 'opacity-40 grayscale'}`}><div className={`w-10 h-10 rounded-full border-2 overflow-hidden ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}><img src={u.avatar} alt={u.name} /></div><span className="text-xs mt-1 truncate w-full text-center">{u.name}</span></div>
                  )
                })}
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-medium text-gray-700">取消</button>
              <button onClick={handleSaveExpense} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium">{editingExpenseId ? '儲存修改' : '新增'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-Component: Settlement View (No changes) ---

function SettlementView({ activity, setActivities, expenses, users }) {
  const birthdayIds = useMemo(() => 
    activity.birthdayPersonIds || (activity.birthdayPersonId ? [activity.birthdayPersonId] : []), 
  [activity]);

  const outsiderIds = useMemo(() => users.filter(u => u.isOutsider).map(u => u.id), [users]);

  const balances = useMemo(() => {
    const bal = {};
    activity.participants.forEach(pid => bal[pid] = 0);
    
    expenses.forEach(exp => {
      const paidBy = exp.payerId;
      const amount = exp.amount;
      const beneficiaries = exp.beneficiaryIds;
      
      if (bal[paidBy] !== undefined) bal[paidBy] += amount;
      
      if (beneficiaries.length > 0) {
        const isHybridMode = exp.excludeBirthday && !exp.excludeOutsiders && birthdayIds.length > 0;

        if (isHybridMode) {
            const totalPeopleCount = beneficiaries.length + birthdayIds.length;
            const baseShare = amount / totalPeopleCount;

            const outsidersInList = beneficiaries.filter(bid => outsiderIds.includes(bid));
            const coreInList = beneficiaries.filter(bid => !outsiderIds.includes(bid));

            outsidersInList.forEach(bid => {
                if (bal[bid] !== undefined) bal[bid] -= baseShare;
            });

            const missingMoney = baseShare * birthdayIds.length;
            const surchargePerCore = coreInList.length > 0 ? (missingMoney / coreInList.length) : 0;

            coreInList.forEach(bid => {
                if (bal[bid] !== undefined) bal[bid] -= (baseShare + surchargePerCore);
            });

        } else {
            const share = amount / beneficiaries.length;
            beneficiaries.forEach(bid => {
              if (bal[bid] !== undefined) bal[bid] -= share;
            });
        }
      }
    });
    return bal;
  }, [expenses, activity, birthdayIds, outsiderIds]);

  const transfers = useMemo(() => {
    let debtors = [];
    let creditors = [];
    
    Object.entries(balances).forEach(([id, amount]) => {
      const val = Math.round(amount * 100) / 100;
      if (val < -1) debtors.push({ id, amount: val });
      if (val > 1) creditors.push({ id, amount: val });
    });

    debtors.sort((a, b) => a.amount - b.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const result = [];
    let i = 0; 
    let j = 0; 

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const amountToPay = Math.min(Math.abs(debtor.amount), creditor.amount);
      
      result.push({
        from: debtor.id,
        to: creditor.id,
        amount: amountToPay
      });

      debtor.amount += amountToPay;
      creditor.amount -= amountToPay;

      if (Math.abs(debtor.amount) < 1) i++;
      if (creditor.amount < 1) j++;
    }

    return result;
  }, [balances]);

  // Helper to get user name
  const getUserName = (id) => users.find(u => u.id === id)?.name || '未知使用者';

  // Function to toggle settlement status
  const toggleSettlement = (userId) => {
    const newSettlementStatus = { ...activity.settlementStatus, [userId]: !activity.settlementStatus[userId] };
    
    // 修正 Bug: 檢查是否「全部完成」時，要忽略金額為 0 的人
    // 邏輯：如果 (金額是 0) 或者 (已經標記為 true)，就算該人員已完成
    const isFullySettled = Object.entries(balances).every(([pid, amount]) => {
        // 如果這個人不在參與名單，跳過
        if (!activity.participants.includes(pid)) return true;
        // 如果金額小於 1 (接近 0)，視為已完成
        if (Math.abs(amount) < 1) return true;
        // 否則，必須要是「已標記 (true)」才算完成
        return newSettlementStatus[pid] === true;
    });

    setActivities(prev => prev.map(a => 
      a.id === activity.id ? { 
        ...a, 
        settlementStatus: newSettlementStatus, 
        isFullySettled: isFullySettled 
      } : a
    ));
  };
  
  const isFullySettled = activity.isFullySettled;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">成員結餘一覽</h2>
      
      <div className={`p-4 rounded-xl border-2 ${isFullySettled ? 'bg-green-50 border-green-300 text-green-700' : 'bg-red-50 border-red-300 text-red-700'}`}>
        <p className="font-medium flex items-center gap-2">
          {isFullySettled ? <Check size={20} /> : <AlertTriangle size={20} />}
          {isFullySettled ? '活動狀態：已全數結清' : '活動狀態：尚有未結清款項'}
        </p>
      </div>

      <div className="space-y-2">
        {Object.entries(balances)
          .filter(([id]) => activity.participants.includes(id)) // Only show participants
          .map(([id, amount]) => {
            const name = getUserName(id);
            const val = Math.round(amount * 100) / 100;
            const absVal = Math.abs(val);
            
            // 修正 Bug: 優先檢查「是否已人工標記」，如果是，就強制顯示結清
            const isManuallySettled = activity.settlementStatus[id];
            
            // 狀態判斷：金額為0 或者 已人工標記 -> 視為結清
            const isSettled = absVal < 1 || isManuallySettled;

            // 顯示文字與顏色
            let statusText = '結清';
            let colorClass = 'text-gray-400';
            let bgClass = 'bg-gray-50'; // 結清的人背景變灰

            if (!isSettled) {
                if (val > 0) {
                    statusText = '應收';
                    colorClass = 'text-green-600';
                    bgClass = 'bg-white';
                } else {
                    statusText = '應付';
                    colorClass = 'text-red-600';
                    bgClass = 'bg-white';
                }
            } else {
                // 如果是人工按掉的，顯示灰色，但保留金額給你看
                statusText = '已結清';
                colorClass = 'text-gray-400 line-through'; // 加上刪除線效果
                bgClass = 'bg-gray-50';
            }
            
            return (
              <div key={id} className={`${bgClass} p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition-colors`}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${!isSettled ? (val > 0 ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-300'}`}></div>
                  <div className={`font-medium text-lg ${isSettled ? 'text-gray-400' : ''}`}>{name}</div>
                </div>
                <div className="text-right">
                  <div className={`${colorClass} font-bold text-xl`}>
                     {/* 如果是結清，顯示文字；否則顯示 狀態 + 金額 */}
                     {statusText} {absVal > 0 && `$${absVal.toLocaleString()}`}
                  </div>
                  {/* 只要金額大於 1，就顯示按鈕讓使用者切換狀態 */}
                  {absVal > 1 && (
                    <button 
                      onClick={() => toggleSettlement(id)}
                      className={`mt-1 text-xs px-2 py-0.5 rounded-full transition ${activity.settlementStatus[id] ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {activity.settlementStatus[id] ? '復原未結清' : '標記已結清'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      <h2 className="text-xl font-bold mt-8">建議結清路徑 ({transfers.length} 筆)</h2>

      {transfers.length === 0 ? (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
          <Check size={20} /> 目前帳務已平衡，無需轉帳。
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {getUserName(t.from)}
              </div>
              <div className="flex items-center gap-3 font-bold text-lg text-blue-600">
                <ArrowRight size={24} />
              </div>
              <div className="text-right text-sm text-gray-500">
                {getUserName(t.to)}
              </div>
              <div className="text-right font-bold text-xl text-green-600">
                ${Math.round(t.amount).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
