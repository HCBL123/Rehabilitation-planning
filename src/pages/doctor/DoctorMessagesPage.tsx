import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { db, auth } from '../../config/firebase';
import { Send, Search } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const DoctorMessagesPage = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      console.log('Selected patient:', selectedPatient);
      const messagesRef = ref(db, 'messages');
      const unsubscribe = onValue(messagesRef, (snapshot) => {
        console.log('Messages snapshot:', snapshot.val());
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesList = Object.entries(messagesData)
            .map(([id, data]: [string, any]) => ({
              id,
              ...data
            }))
            .filter((msg: Message) => {
              console.log('Checking message:', msg);
              return (msg.senderId === auth.currentUser?.uid && msg.receiverId === selectedPatient.id) ||
                     (msg.senderId === selectedPatient.id && msg.receiverId === auth.currentUser?.uid);
            })
            .sort((a, b) => a.timestamp - b.timestamp);
          
          console.log('Filtered messages:', messagesList);
          setMessages(messagesList);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [selectedPatient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPatients = async () => {
    console.log('Fetching patients...');
    const patientsRef = ref(db, 'patients');
    onValue(patientsRef, (snapshot) => {
      console.log('Patients snapshot:', snapshot.val());
      if (snapshot.exists()) {
        const patientsData = snapshot.val();
        const patientsList = Object.entries(patientsData)
          .filter(([_, data]: [string, any]) => {
            console.log('Checking patient:', data);
            console.log('Current doctor ID:', auth.currentUser?.uid);
            return data.doctorId === auth.currentUser?.uid;
          })
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }));
        console.log('Filtered patients:', patientsList);
        setPatients(patientsList);
      } else {
        console.log('No patients found');
      }
      setLoading(false);
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPatient || !auth.currentUser) return;

    const messagesRef = ref(db, 'messages');
    const newMessageData = {
      senderId: auth.currentUser.uid,
      receiverId: selectedPatient.id,
      content: newMessage.trim(),
      timestamp: serverTimestamp(),
      read: false
    };

    await push(messagesRef, newMessageData);
    setNewMessage('');
  };

  const filteredPatients = patients.filter(patient => 
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow h-[calc(100vh-9rem)] flex">
          {/* Patients Sidebar */}
          <div className="w-1/4 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-5rem)]">
              {filteredPatients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {patient.firstName[0]}{patient.lastName[0]}
                    </span>
                  </div>
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedPatient ? (
              <>
                {/* Selected Patient Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          message.senderId === auth.currentUser?.uid
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">Select a patient to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorMessagesPage; 