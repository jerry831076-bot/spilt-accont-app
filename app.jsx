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
  AlertTriangle
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
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

export default function SplitBillApp() {
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

      {/* Persistent Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 fixed bottom-0 w-full z-10">
        <div className="max-w-md mx-auto grid grid-cols-2 h-16">
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
        </div>
      </nav>
    </div>
  );
}

// --- Sub-Component: Personnel View ---
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

// --- Sub-Component: Activities View ---

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
      totalExpense: 0,
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
              <div className="text-xl font-bold text-blue-600">${activity.totalExpense.toLocaleString()}</div>
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

// --- Sub-Component: Expenses View ---

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
    syncActivityTotal(updatedExpenses);
    setIsModalOpen(false);
  };

  const executeDelete = () => {
      if(confirmDeleteId) {
        const updatedExpenses = allExpenses.filter(e => e.id !== confirmDeleteId);
        setExpenses(updatedExpenses);
        syncActivityTotal(updatedExpenses);
        setConfirmDeleteId(null);
      }
  };

  const syncActivityTotal = (currentExpenses) => {
    const storedActivities = JSON.parse(localStorage.getItem('split-bill-activities') || '[]');
    const newTotal = currentExpenses
    .filter(e => e.activityId === activity.id)
    .reduce((sum, e) => sum + e.amount, 0);
    
    const updatedActivityList = storedActivities.map(a => 
    a.id === activity.id ? { ...a, totalExpense: newTotal } : a
    );
    localStorage.setItem('split-bill-activities', JSON.stringify(updatedActivityList));
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

// --- Sub-Component: Settlement View ---

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

  const toggleSettlement = (userId) => {
    const storedActivities = JSON.parse(localStorage.getItem('split-bill-activities') || '[]');
    const freshActivity = storedActivities.find(a => a.id === activity.id);
    
    if(!freshActivity) return;

    const currentStatus = freshActivity.settlementStatus || {};
    const newStatus = !currentStatus[userId];
    
    const updatedStatusMap = {
      ...currentStatus,
      [userId]: newStatus
    };

    const allSettled = activity.participants.every(pid => updatedStatusMap[pid] === true);

    const updatedActivity = {
      ...freshActivity,
      settlementStatus: updatedStatusMap,
      isFullySettled: allSettled
    };

    const newActivityList = storedActivities.map(a => a.id === activity.id ? updatedActivity : a);
    setActivities(newActivityList);
    localStorage.setItem('split-bill-activities', JSON.stringify(newActivityList));
  };

  const settledCount = Object.values(activity.settlementStatus || {}).filter(Boolean).length;
  const totalCount = activity.participants.length;
  
  return (
    <div className="space-y-6 pb-20">
      <div className="bg-blue-600 text-white p-5 rounded-xl shadow-lg">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Calculator size={20} /> 最佳轉帳建議
        </h3>
        {transfers.length === 0 ? (
          <div className="text-blue-100 text-sm">目前沒有需要轉帳的款項。</div>
        ) : (
          <div className="space-y-3">
            {transfers.map((t, idx) => {
               const fromUser = users.find(u => u.id === t.from);
               const toUser = users.find(u => u.id === t.to);
               return (
                 <div key={idx} className="bg-white/10 p-3 rounded-lg flex items-center justify-between backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{fromUser?.name}</span>
                      <ArrowRight size={16} className="opacity-70" />
                      <span className="font-medium">{toUser?.name}</span>
                    </div>
                    <div className="font-bold text-lg">${Math.round(t.amount)}</div>
                 </div>
               );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-gray-800 mb-3 px-1">結清確認表</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-gray-100">
            {activity.participants.map(userId => {
              const user = users.find(u => u.id === userId);
              const net = balances[userId] || 0;
              const isSettled = activity.settlementStatus?.[userId];
              const isBirthday = birthdayIds.includes(userId);
              const isOutsider = user?.isOutsider;

              return (
                <div key={userId} className={`p-4 flex items-center justify-between transition ${isSettled ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                  <div className="flex items-center gap-3">
                     <button onClick={() => toggleSettlement(userId)} className={`w-6 h-6 rounded border flex items-center justify-center transition ${isSettled ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'}`}>{isSettled && <Check size={16} />}</button>
                     <div>
                       <div className={`font-medium flex items-center gap-1 ${isSettled && 'line-through decoration-gray-400 text-gray-500'}`}>
                         {user?.name}
                         {isBirthday && <span className="text-xs no-underline">🎂</span>}
                         {isOutsider && <span className="text-[10px] bg-orange-100 text-orange-600 px-1 rounded no-underline">外賓</span>}
                       </div>
                       <div className="text-xs text-gray-400">{net > 0 ? '應收' : net < 0 ? '應付' : '無收付'}</div>
                     </div>
                  </div>
                  <div className={`font-bold text-lg ${net > 0 ? 'text-green-600' : net < 0 ? 'text-red-500' : 'text-gray-400'} ${isSettled && 'line-through decoration-gray-400 text-gray-400'}`}>
                    {net > 0 ? `+$${Math.round(net)}` : net < 0 ? `-$${Math.round(Math.abs(net))}` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="fixed bottom-20 left-0 w-full px-4 pointer-events-none"><div className="bg-gray-900/90 text-white backdrop-blur p-3 rounded-lg shadow-lg flex justify-between items-center max-w-md mx-auto pointer-events-auto"><div className="text-sm font-medium">結案進度: {settledCount} / {totalCount} 人</div>{activity.isFullySettled && <div className="flex items-center gap-1 text-green-400 font-bold text-sm"><Check size={16} /> 全員結清</div>}</div></div>
    </div>
  );
}