import { Server } from "socket.io";
import { createServer } from "http";

interface StorylineEvent {
  id: string;
  type: 'threat_spawn' | 'soldier_vitals' | 'mission_objective' | 'weather_change' | 'communication' | 'judge_trigger';
  data: any;
  timestamp: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SoldierVitals {
  id: string;
  name: string;
  hr: number;
  bp_systolic: number;
  bp_diastolic: number;
  temp: number;
  oxygen: number;
  status: 'normal' | 'stressed' | 'wounded' | 'critical';
  location: [number, number];
}

interface ThreatData {
  id: string;
  type: 'hostile_patrol' | 'sniper' | 'vehicle' | 'mortar' | 'ied' | 'drone';
  location: [number, number];
  threat_level: 'low' | 'medium' | 'high';
  detected: boolean;
  movement_pattern?: [number, number][];
}

interface MissionObjective {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  location?: [number, number];
  deadline?: number;
}

export class StorylineEngine {
  private io: Server;
  private soldiers: SoldierVitals[] = [];
  private threats: ThreatData[] = [];
  private objectives: MissionObjective[] = [];
  private eventQueue: StorylineEvent[] = [];
  private isRunning = false;
  private eventId = 0;

  constructor(httpServer: any) {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.initializeDefaultData();
    this.setupSocketHandlers();
  }

  private initializeDefaultData() {
    // Initialize soldiers
    this.soldiers = [
      {
        id: 'TAC-1058',
        name: 'Marcus Reynolds',
        hr: 85,
        bp_systolic: 120,
        bp_diastolic: 80,
        temp: 98.6,
        oxygen: 98,
        status: 'normal',
        location: [35.2, 45.8]
      },
      {
        id: 'TAC-1059',
        name: 'Sarah Chen',
        hr: 78,
        bp_systolic: 115,
        bp_diastolic: 75,
        temp: 98.4,
        oxygen: 99,
        status: 'normal',
        location: [35.21, 45.81]
      },
      {
        id: 'TAC-1060',
        name: 'David Torres',
        hr: 92,
        bp_systolic: 130,
        bp_diastolic: 85,
        temp: 99.1,
        oxygen: 96,
        status: 'stressed',
        location: [35.19, 45.79]
      },
      {
        id: 'TAC-1061',
        name: 'Emma Wilson',
        hr: 88,
        bp_systolic: 125,
        bp_diastolic: 82,
        temp: 98.8,
        oxygen: 97,
        status: 'normal',
        location: [35.22, 45.82]
      }
    ];

    // Initialize mission objectives
    this.objectives = [
      {
        id: 'OBJ-001',
        title: 'Secure LZ Alpha',
        description: 'Establish and secure landing zone for extraction',
        status: 'active',
        priority: 'high',
        location: [35.25, 45.85],
        deadline: Date.now() + 3600000 // 1 hour
      },
      {
        id: 'OBJ-002',
        title: 'Locate HVT',
        description: 'Find and secure high-value target in sector 7',
        status: 'pending',
        priority: 'medium',
        location: [35.18, 45.77]
      }
    ];
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected to storyline engine:', socket.id);

      // Send initial state
      socket.emit('initial_state', {
        soldiers: this.soldiers,
        threats: this.threats,
        objectives: this.objectives
      });

      // Handle judge triggers
      socket.on('judge_trigger', (trigger) => {
        this.handleJudgeTrigger(trigger);
      });

      // Handle start/stop storyline
      socket.on('start_storyline', () => {
        this.startStoryline();
      });

      socket.on('stop_storyline', () => {
        this.stopStoryline();
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  private generateEventId(): string {
    return `EVENT-${++this.eventId}-${Date.now()}`;
  }

  private broadcastEvent(event: StorylineEvent) {
    this.io.emit('storyline_event', event);
    console.log(`Broadcasting event: ${event.type} - ${event.id}`);
  }

  public startStoryline() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Storyline engine started');
    
    // Threat spawning every 2-3 minutes
    const threatInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(threatInterval);
        return;
      }
      this.spawnRandomThreat();
    }, Math.random() * 60000 + 120000); // 2-3 minutes

    // Soldier vitals changes every 10-15 seconds
    const vitalsInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(vitalsInterval);
        return;
      }
      this.updateSoldierVitals();
    }, Math.random() * 5000 + 10000); // 10-15 seconds

    // Mission objective changes every 5-10 minutes
    const objectiveInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(objectiveInterval);
        return;
      }
      this.updateMissionObjectives();
    }, Math.random() * 300000 + 300000); // 5-10 minutes
  }

  public stopStoryline() {
    this.isRunning = false;
    console.log('Storyline engine stopped');
  }

  private spawnRandomThreat() {
    const threatTypes: ThreatData['type'][] = ['hostile_patrol', 'sniper', 'vehicle', 'mortar', 'ied'];
    const randomType = threatTypes[Math.floor(Math.random() * threatTypes.length)];
    
    const threat: ThreatData = {
      id: `THREAT-${Date.now()}`,
      type: randomType,
      location: [
        35.15 + Math.random() * 0.15, // Random location in area
        45.75 + Math.random() * 0.15
      ],
      threat_level: Math.random() < 0.3 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low',
      detected: Math.random() < 0.7 // 70% chance of detection
    };

    this.threats.push(threat);

    const event: StorylineEvent = {
      id: this.generateEventId(),
      type: 'threat_spawn',
      data: threat,
      timestamp: Date.now(),
      priority: threat.threat_level === 'high' ? 'critical' : 'medium'
    };

    this.broadcastEvent(event);
  }

  private updateSoldierVitals() {
    const soldier = this.soldiers[Math.floor(Math.random() * this.soldiers.length)];
    
    // Simulate realistic vital changes
    const stressFactors = this.threats.filter(t => t.threat_level === 'high').length;
    const baseStress = stressFactors * 5;

    soldier.hr = Math.max(60, Math.min(140, soldier.hr + (Math.random() - 0.5) * 10 + baseStress));
    soldier.bp_systolic = Math.max(90, Math.min(160, soldier.bp_systolic + (Math.random() - 0.5) * 8));
    soldier.bp_diastolic = Math.max(60, Math.min(100, soldier.bp_diastolic + (Math.random() - 0.5) * 5));
    soldier.temp = Math.max(97, Math.min(102, soldier.temp + (Math.random() - 0.5) * 0.5));
    soldier.oxygen = Math.max(90, Math.min(100, soldier.oxygen + (Math.random() - 0.5) * 2));

    // Update status based on vitals
    if (soldier.hr > 120 || soldier.bp_systolic > 140 || soldier.temp > 100 || soldier.oxygen < 95) {
      soldier.status = 'stressed';
    } else if (soldier.hr > 100 || soldier.bp_systolic > 130) {
      soldier.status = 'stressed';
    } else {
      soldier.status = 'normal';
    }

    const event: StorylineEvent = {
      id: this.generateEventId(),
      type: 'soldier_vitals',
      data: soldier,
      timestamp: Date.now(),
      priority: soldier.status === 'critical' ? 'critical' : 'low'
    };

    this.broadcastEvent(event);
  }

  private updateMissionObjectives() {
    const scenarios = [
      {
        title: 'Evacuate injured soldier from sector 5B',
        description: 'Medical emergency requiring immediate evacuation',
        priority: 'high' as const,
        location: [35.17, 45.76] as [number, number]
      },
      {
        title: 'Investigate suspicious activity in sector 3A',
        description: 'Intel reports unusual movement patterns',
        priority: 'medium' as const,
        location: [35.23, 45.79] as [number, number]
      },
      {
        title: 'Establish overwatch position on Hill 247',
        description: 'Secure elevated position for tactical advantage',
        priority: 'low' as const,
        location: [35.26, 45.84] as [number, number]
      },
      {
        title: 'Secure abandoned supply cache',
        description: 'Recover supplies from compromised location',
        priority: 'medium' as const,
        location: [35.14, 45.78] as [number, number]
      }
    ];

    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const newObjective: MissionObjective = {
      id: `OBJ-${Date.now()}`,
      title: randomScenario.title,
      description: randomScenario.description,
      status: 'pending',
      priority: randomScenario.priority,
      location: randomScenario.location,
      deadline: Date.now() + (Math.random() * 1800000 + 900000) // 15-45 minutes
    };

    this.objectives.push(newObjective);

    const event: StorylineEvent = {
      id: this.generateEventId(),
      type: 'mission_objective',
      data: newObjective,
      timestamp: Date.now(),
      priority: newObjective.priority === 'high' ? 'critical' : 'medium'
    };

    this.broadcastEvent(event);
  }

  private handleJudgeTrigger(trigger: any) {
    console.log('Judge trigger received:', trigger);

    const event: StorylineEvent = {
      id: this.generateEventId(),
      type: 'judge_trigger',
      data: trigger,
      timestamp: Date.now(),
      priority: 'critical'
    };

    // Handle specific trigger types
    switch (trigger.type) {
      case 'blackout':
        // Simulate blackout mode effects
        this.soldiers.forEach(soldier => {
          soldier.status = 'stressed';
          soldier.hr += 15;
        });
        break;
        
      case 'drone_deploy':
        // Add drone threat detection
        this.threats.forEach(threat => {
          threat.detected = true;
        });
        break;
        
      case 'comm_breakdown':
        // Simulate communication issues
        break;
        
      case 'threat_spawn':
        // Force spawn specific threat
        if (trigger.data) {
          const forcedThreat: ThreatData = {
            id: `JUDGE-THREAT-${Date.now()}`,
            type: trigger.data.type,
            location: [35.15 + Math.random() * 0.15, 45.75 + Math.random() * 0.15],
            threat_level: 'high',
            detected: true
          };
          this.threats.push(forcedThreat);
        }
        break;
    }

    this.broadcastEvent(event);
  }

  public getStats() {
    return {
      soldiers: this.soldiers.length,
      threats: this.threats.length,
      objectives: this.objectives.length,
      isRunning: this.isRunning
    };
  }
}
