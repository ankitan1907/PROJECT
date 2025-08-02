import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Heart, 
  Pill, 
  BookOpen, 
  Phone, 
  MapPin, 
  Shield, 
  Bot,
  Plus,
  Bell,
  Smile,
  Meh,
  Frown,
  AlertCircle,
  Droplets,
  Moon,
  Coffee,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import WellnessChatbot from '@/components/WellnessChatbot';

interface PeriodData {
  lastPeriod: string;
  cycleLength: number;
  periodLength: number;
}

interface MedicineReminder {
  id: string;
  name: string;
  time: string;
  frequency: string;
  notes?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  mood: 'happy' | 'neutral' | 'sad';
  symptoms: string[];
  notes: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export default function MyWellness() {
  const [activeSection, setActiveSection] = useState('overview');
  const [periodData, setPeriodData] = useState<PeriodData>({ lastPeriod: '', cycleLength: 28, periodLength: 5 });
  const [medicines, setMedicines] = useState<MedicineReminder[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [newMedicine, setNewMedicine] = useState({ name: '', time: '', frequency: 'daily' });
  const [todayMood, setTodayMood] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [journalNotes, setJournalNotes] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedPeriodData = localStorage.getItem('sakhi_period_data');
    const storedMedicines = localStorage.getItem('sakhi_medicines');
    const storedJournal = localStorage.getItem('sakhi_journal');
    const storedContacts = localStorage.getItem('sakhi_emergency_contacts');

    if (storedPeriodData) setPeriodData(JSON.parse(storedPeriodData));
    if (storedMedicines) setMedicines(JSON.parse(storedMedicines));
    if (storedJournal) setJournalEntries(JSON.parse(storedJournal));
    if (storedContacts) setEmergencyContacts(JSON.parse(storedContacts));
  }, []);

  // Calculate next period and fertile window
  const calculatePeriodInfo = () => {
    if (!periodData.lastPeriod) return null;
    
    const lastDate = new Date(periodData.lastPeriod);
    const nextPeriod = new Date(lastDate.getTime() + (periodData.cycleLength * 24 * 60 * 60 * 1000));
    const ovulation = new Date(nextPeriod.getTime() - (14 * 24 * 60 * 60 * 1000));
    const fertileStart = new Date(ovulation.getTime() - (5 * 24 * 60 * 60 * 1000));
    const fertileEnd = new Date(ovulation.getTime() + (1 * 24 * 60 * 60 * 1000));

    const daysUntilPeriod = Math.ceil((nextPeriod.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    
    return {
      nextPeriod: nextPeriod.toLocaleDateString(),
      daysUntilPeriod,
      fertileWindow: `${fertileStart.toLocaleDateString()} - ${fertileEnd.toLocaleDateString()}`,
      phase: daysUntilPeriod <= 7 ? 'premenstrual' : daysUntilPeriod <= 14 ? 'luteal' : 'follicular'
    };
  };

  const savePeriodData = (data: PeriodData) => {
    setPeriodData(data);
    localStorage.setItem('sakhi_period_data', JSON.stringify(data));
  };

  const addMedicine = () => {
    if (newMedicine.name && newMedicine.time) {
      const medicine: MedicineReminder = {
        id: Date.now().toString(),
        ...newMedicine
      };
      const updatedMedicines = [...medicines, medicine];
      setMedicines(updatedMedicines);
      localStorage.setItem('sakhi_medicines', JSON.stringify(updatedMedicines));
      setNewMedicine({ name: '', time: '', frequency: 'daily' });
    }
  };

  const saveJournalEntry = () => {
    if (todayMood) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        mood: todayMood,
        symptoms: selectedSymptoms,
        notes: journalNotes
      };
      const updatedEntries = [entry, ...journalEntries.filter(e => e.date !== entry.date)];
      setJournalEntries(updatedEntries);
      localStorage.setItem('sakhi_journal', JSON.stringify(updatedEntries));
      setJournalNotes('');
      setSelectedSymptoms([]);
    }
  };

  const periodInfo = calculatePeriodInfo();
  const symptomsOptions = ['Cramps', 'Bloating', 'Headache', 'Mood swings', 'Fatigue', 'Breast tenderness', 'Acne', 'Back pain'];

  const wellnessSections = [
    { id: 'overview', icon: Heart, label: 'Overview' },
    { id: 'period', icon: Calendar, label: 'Period Tracker' },
    { id: 'medicines', icon: Pill, label: 'Reminders' },
    { id: 'journal', icon: BookOpen, label: 'Self-Care Journal' },
    { id: 'emergency', icon: Phone, label: 'Emergency Support' },
    { id: 'places', icon: MapPin, label: 'Safe Places' },
    { id: 'bot', icon: Bot, label: 'Ask Sakhi' },
  ];

  const moodIcons = {
    happy: <Smile className="w-6 h-6 text-green-500" />,
    neutral: <Meh className="w-6 h-6 text-yellow-500" />,
    sad: <Frown className="w-6 h-6 text-red-500" />
  };

  const quotes = [
    "You are stronger than you think 💪",
    "Take time for yourself today 🌸",
    "Your health matters - listen to your body 🎯",
    "Every small step counts towards wellness 🌱",
    "You deserve love and care, especially from yourself 💝"
  ];

  const todayQuote = quotes[new Date().getDate() % quotes.length];

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground mb-2">
          My Wellness Hub 🌸
        </h1>
        <p className="text-muted-foreground">
          Your personal space for health & wellbeing
        </p>
      </motion.div>

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4 text-center bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20"
      >
        <p className="text-sm font-medium text-foreground">{todayQuote}</p>
      </motion.div>

      {/* Section Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex overflow-x-auto gap-2 pb-2"
      >
        {wellnessSections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className={`min-w-fit rounded-full ${activeSection === section.id 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                : 'hover:bg-pink-50'}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {section.label}
            </Button>
          );
        })}
      </motion.div>

      {/* Content based on active section */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4"
      >
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="grid gap-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-500" />
                  Today's Wellness Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {periodInfo ? `${periodInfo.daysUntilPeriod} days` : 'Set up'}
                    </p>
                    <p className="text-xs text-muted-foreground">Until period</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Pill className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">{medicines.length}</p>
                    <p className="text-xs text-muted-foreground">Reminders</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <Heart className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {journalEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).length > 0 ? '✓' : '○'}
                    </p>
                    <p className="text-xs text-muted-foreground">Mood logged</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">{emergencyContacts.length}</p>
                    <p className="text-xs text-muted-foreground">Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Period Tracker Section */}
        {activeSection === 'period' && (
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-pink-500" />
                  Menstrual Cycle Tracker
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="lastPeriod">Last Period Start Date</Label>
                    <Input
                      id="lastPeriod"
                      type="date"
                      value={periodData.lastPeriod}
                      onChange={(e) => savePeriodData({ ...periodData, lastPeriod: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                      <Input
                        id="cycleLength"
                        type="number"
                        min="21"
                        max="35"
                        value={periodData.cycleLength}
                        onChange={(e) => savePeriodData({ ...periodData, cycleLength: parseInt(e.target.value) || 28 })}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodLength">Period Length (days)</Label>
                      <Input
                        id="periodLength"
                        type="number"
                        min="3"
                        max="8"
                        value={periodData.periodLength}
                        onChange={(e) => savePeriodData({ ...periodData, periodLength: parseInt(e.target.value) || 5 })}
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {periodInfo && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-xl">
                    <h3 className="font-semibold mb-3">Your Cycle Predictions</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Next Period:</strong> {periodInfo.nextPeriod} ({periodInfo.daysUntilPeriod} days)</p>
                      <p><strong>Fertile Window:</strong> {periodInfo.fertileWindow}</p>
                      <p><strong>Current Phase:</strong> 
                        <Badge variant="secondary" className="ml-2 capitalize">
                          {periodInfo.phase}
                        </Badge>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Medicine Reminders Section */}
        {activeSection === 'medicines' && (
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-500" />
                  Medicine & Supplement Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add New Medicine */}
                <div className="p-4 border border-dashed border-muted rounded-xl space-y-3">
                  <h4 className="font-medium">Add New Reminder</h4>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Medicine/Supplement name"
                      value={newMedicine.name}
                      onChange={(e) => setNewMedicine({ ...newMedicine, name: e.target.value })}
                      className="rounded-xl"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="time"
                        value={newMedicine.time}
                        onChange={(e) => setNewMedicine({ ...newMedicine, time: e.target.value })}
                        className="rounded-xl"
                      />
                      <Select
                        value={newMedicine.frequency}
                        onValueChange={(value) => setNewMedicine({ ...newMedicine, frequency: value })}
                      >
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="as-needed">As Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addMedicine} className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Reminder
                    </Button>
                  </div>
                </div>

                {/* Medicine List */}
                <div className="space-y-2">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {medicine.time} • {medicine.frequency}
                        </p>
                      </div>
                      <Bell className="w-5 h-5 text-purple-500" />
                    </div>
                  ))}
                  {medicines.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No reminders set. Add one above to get started!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Self-Care Journal Section */}
        {activeSection === 'journal' && (
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Daily Self-Care Journal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Today's Check-in */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <h4 className="font-medium mb-3">How are you feeling today?</h4>
                  <div className="flex gap-4 mb-4">
                    {Object.entries(moodIcons).map(([mood, icon]) => (
                      <button
                        key={mood}
                        onClick={() => setTodayMood(mood as any)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          todayMood === mood 
                            ? 'border-primary bg-primary/10' 
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* Symptoms */}
                  <div className="mb-4">
                    <Label className="text-sm font-medium mb-2 block">Any symptoms today?</Label>
                    <div className="flex flex-wrap gap-2">
                      {symptomsOptions.map((symptom) => (
                        <button
                          key={symptom}
                          onClick={() => {
                            if (selectedSymptoms.includes(symptom)) {
                              setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
                            } else {
                              setSelectedSymptoms([...selectedSymptoms, symptom]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs border ${
                            selectedSymptoms.includes(symptom)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-background border-muted hover:border-primary'
                          }`}
                        >
                          {symptom}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <Textarea
                    placeholder="How was your day? Any thoughts or feelings you'd like to record..."
                    value={journalNotes}
                    onChange={(e) => setJournalNotes(e.target.value)}
                    className="rounded-xl"
                    rows={3}
                  />
                  
                  <Button 
                    onClick={saveJournalEntry} 
                    disabled={!todayMood}
                    className="w-full mt-3 rounded-xl"
                  >
                    Save Today's Entry
                  </Button>
                </div>

                {/* Recent Entries */}
                <div>
                  <h4 className="font-medium mb-3">Recent Entries</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {journalEntries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="p-3 bg-muted/20 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{new Date(entry.date).toLocaleDateString()}</span>
                          {moodIcons[entry.mood]}
                        </div>
                        {entry.symptoms.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {entry.symptoms.map((symptom) => (
                              <Badge key={symptom} variant="secondary" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        )}
                      </div>
                    ))}
                    {journalEntries.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Start journaling to track your wellness journey!
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Emergency Support Section */}
        {activeSection === 'emergency' && (
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-red-500" />
                  Emergency Health Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Alert */}
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    Quick Health Alert
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                      Not feeling well
                    </Button>
                    <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                      Severe cramps
                    </Button>
                    <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                      Need support
                    </Button>
                    <Button variant="outline" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                      Emergency
                    </Button>
                  </div>
                </div>

                {/* Health Helplines */}
                <div className="space-y-2">
                  <h4 className="font-medium">Health Helplines</h4>
                  <div className="space-y-2">
                    <a href="tel:108" className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div>
                        <p className="font-medium">Emergency Medical</p>
                        <p className="text-sm text-muted-foreground">24/7 ambulance service</p>
                      </div>
                      <span className="font-bold text-green-600">108</span>
                    </a>
                    <a href="tel:1091" className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                      <div>
                        <p className="font-medium">Women's Helpline</p>
                        <p className="text-sm text-muted-foreground">24/7 support for women</p>
                      </div>
                      <span className="font-bold text-pink-600">1091</span>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Safe Places Section */}
        {activeSection === 'places' && (
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Safe Clinics & Washrooms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Coffee className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Find period-friendly places nearby
                  </p>
                  <Button className="rounded-xl">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Safe Places
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sakhi Bot Section */}
        {activeSection === 'bot' && (
          <div className="space-y-4">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-purple-500" />
                  Ask Sakhi - Your Wellness Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <WellnessChatbot />
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
