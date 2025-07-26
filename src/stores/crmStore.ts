import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notes: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  status: 'new' | 'qualified' | 'converted' | 'lost';
  assignedTo: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  contactId: string;
  assignedTo: string;
  closeDate: Date;
  probability: number;
  createdAt: Date;
  updatedAt: Date;
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  relatedTo?: {
    type: 'contact' | 'lead' | 'deal';
    id: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CRMState {
  contacts: Contact[];
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  
  // Contacts
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  
  // Leads
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  
  // Deals
  addDeal: (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set) => ({
      contacts: [],
      leads: [],
      deals: [],
      tasks: [],
      
      // Contacts
      addContact: (contact) => {
        const newContact: Contact = {
          ...contact,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ contacts: [...state.contacts, newContact] }));
      },
      
      updateContact: (id, updates) => {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id 
              ? { ...contact, ...updates, updatedAt: new Date() }
              : contact
          ),
        }));
      },
      
      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        }));
      },
      
      // Leads
      addLead: (lead) => {
        const newLead: Lead = {
          ...lead,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ leads: [...state.leads, newLead] }));
      },
      
      updateLead: (id, updates) => {
        set((state) => ({
          leads: state.leads.map((lead) =>
            lead.id === id 
              ? { ...lead, ...updates, updatedAt: new Date() }
              : lead
          ),
        }));
      },
      
      deleteLead: (id) => {
        set((state) => ({
          leads: state.leads.filter((lead) => lead.id !== id),
        }));
      },
      
      // Deals
      addDeal: (deal) => {
        const newDeal: Deal = {
          ...deal,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ deals: [...state.deals, newDeal] }));
      },
      
      updateDeal: (id, updates) => {
        set((state) => ({
          deals: state.deals.map((deal) =>
            deal.id === id 
              ? { ...deal, ...updates, updatedAt: new Date() }
              : deal
          ),
        }));
      },
      
      deleteDeal: (id) => {
        set((state) => ({
          deals: state.deals.filter((deal) => deal.id !== id),
        }));
      },
      
      // Tasks
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id 
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
    }),
    {
      name: 'crm-data',
    }
  )
);