import React, { useState } from 'react';
import { useToasts } from '../components/Toast';
import { TrashIcon } from '../components/Icon';
import ConfirmationModal from '../components/ConfirmationModal';

interface SettingsProps {
    settings: { 
        salesTarget: number;
        renewalReminders: { days: number[] };
    };
    setSettings: React.Dispatch<React.SetStateAction<{ 
        salesTarget: number;
        renewalReminders: { days: number[] };
    }>>;
}

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
    const { addToast } = useToasts();
    const [localSettings, setLocalSettings] = useState(settings);
    const [newReminderDay, setNewReminderDay] = useState('');
    const [dayToDelete, setDayToDelete] = useState<number | null>(null);

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTarget = parseInt(e.target.value, 10);
        if (!isNaN(newTarget) && newTarget >= 0) {
            setLocalSettings(prev => ({ ...prev, salesTarget: newTarget }));
        }
    };

    const handleAddReminderDay = () => {
        const day = parseInt(newReminderDay, 10);
        if (isNaN(day) || day <= 0) {
            addToast('Please enter a valid positive number of days.', 'error');
            return;
        }
        if (localSettings.renewalReminders.days.includes(day)) {
            addToast(`Reminder for ${day} days already exists.`, 'info');
            return;
        }

        const newDays = [...localSettings.renewalReminders.days, day].sort((a,b) => b-a);
        setLocalSettings(prev => ({...prev, renewalReminders: { days: newDays }}));
        setNewReminderDay('');
        addToast(`Added reminder for ${day} days. Remember to save all settings.`, 'success');
    };
    
    const handleRemoveClick = (day: number) => {
        setDayToDelete(day);
    };

    const confirmRemoveDay = () => {
        if (dayToDelete !== null) {
            const newDays = localSettings.renewalReminders.days.filter(d => d !== dayToDelete);
            setLocalSettings(prev => ({...prev, renewalReminders: { days: newDays }}));
            addToast(`Removed reminder for ${dayToDelete} days. Remember to save all settings.`, 'success');
            setDayToDelete(null);
        }
    };

    const handleSave = () => {
        setSettings(localSettings);
        addToast('Settings saved successfully!', 'success');
    }

    return (
        <>
            <div className="glass-pane" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>إعدادات النظام</h3>
                    <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={handleSave}>
                        حفظ كل الإعدادات
                    </button>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>
                    هذه الصفحة مخصصة للمسؤولين لإدارة المستخدمين، الصلاحيات، إعدادات التكاملات، والإشعارات.
                </p>

                 <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>إدارة المستخدمين</h4>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>إضافة، تعديل، وحذف المستخدمين وتعيين الأدوار لهم.</p>
                    {/* This button would navigate to the Users page */}
                    <button className="btn btn-primary" style={{ marginTop: '0.75rem' }}>
                        إدارة المستخدمين
                    </button>
                </div>
                 <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>إعدادات المشتريات والموردين</h4>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>تكوين الإعدادات الافتراضية لوحدة المشتريات والموردين.</p>
                     <div style={{display: 'flex', gap: '1rem', marginTop: '0.75rem'}}>
                        {/* These buttons would navigate to their respective settings pages */}
                        <button className="btn btn-ghost">إعدادات المشتريات</button>
                        <button className="btn btn-ghost">إعدادات الموردين</button>
                    </div>
                </div>
                 <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>الإعدادات المالية</h4>
                    <div style={{maxWidth: '400px', marginTop: '1rem'}}>
                        <label className="form-label">هدف المبيعات الشهري ($)</label>
                        <input 
                            type="number"
                            className="form-input"
                            value={localSettings.salesTarget}
                            onChange={handleTargetChange}
                            min="0"
                            step="1000"
                        />
                         <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                            يستخدم هذا الهدف في لوحة التحكم لقياس الأداء.
                        </p>
                    </div>
                </div>
                 <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>إعدادات تنبيهات التجديد</h4>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        قم بتعيين الأيام التي سيقوم النظام بإرسال تنبيهات فيها قبل تاريخ انتهاء الصلاحية.
                    </p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem', maxWidth: '500px'}}>
                        <input 
                            type="number"
                            className="form-input"
                            placeholder="إضافة يوم (مثال: 60)"
                            value={newReminderDay}
                            onChange={(e) => setNewReminderDay(e.target.value)}
                            min="1"
                        />
                        <button onClick={handleAddReminderDay} className="btn btn-primary" style={{flexShrink: 0}}>إضافة</button>
                    </div>
                    <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem'}}>
                        {localSettings.renewalReminders.days.map(day => (
                            <div key={day} style={{
                                background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', borderRadius: '12px',
                                padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                            }}>
                               <span>قبل {day} يوم</span>
                               <button onClick={() => handleRemoveClick(day)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)'}}>
                                   <TrashIcon style={{width: '16px', height: '16px'}} />
                               </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {dayToDelete !== null && (
                <ConfirmationModal
                    isOpen={dayToDelete !== null}
                    onClose={() => setDayToDelete(null)}
                    onConfirm={confirmRemoveDay}
                    title="تأكيد الحذف"
                    message={`هل أنت متأكد من أنك تريد حذف تنبيه ${dayToDelete} يوم؟`}
                />
            )}
        </>
    );
};

export default Settings;