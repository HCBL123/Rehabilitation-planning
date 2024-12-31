import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, push, serverTimestamp, get } from 'firebase/database';
import { db, auth } from '../../config/firebase';
import { MessageCircle, Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  photoURL?: string;
}

const MessagesPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [assignedDoctor, setAssignedDoctor] = useState<Doctor | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    // First, fetch the assigned doctor
    const fetchAssignedDoctor = async () => {
      const patientRef = ref(db, `patients/${auth.currentUser!.uid}`);
      const snapshot = await get(patientRef);
      
      if (snapshot.exists() && snapshot.val().doctorId) {
        const doctorId = snapshot.val().doctorId;
        const doctorRef = ref(db, `doctors/${doctorId}`);
        const doctorSnapshot = await get(doctorRef);
        
        if (doctorSnapshot.exists()) {
          setAssignedDoctor({
            id: doctorId,
            ...doctorSnapshot.val()
          });
        }
      }
    };

    fetchAssignedDoctor();

    // Listen to messages
    const messagesRef = ref(db, 'messages');
    
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (snapshot.exists()) {
        const messagesData = snapshot.val();
        const messagesList = Object.entries(messagesData)
          .map(([id, data]: [string, any]) => ({
            id,
            ...data
          }))
          .filter((msg: Message) => {
            return (msg.senderId === auth.currentUser?.uid && msg.receiverId === assignedDoctor?.id) ||
                   (msg.senderId === assignedDoctor?.id && msg.receiverId === auth.currentUser?.uid);
          })
          .sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(messagesList);
        scrollToBottom();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeMessages();
    };
  }, [assignedDoctor]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser || !assignedDoctor) return;

    const messagesRef = ref(db, 'messages');
    await push(messagesRef, {
      senderId: auth.currentUser.uid,
      receiverId: assignedDoctor.id,
      content: newMessage.trim(),
      timestamp: serverTimestamp(),
      read: false
    });

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Doctor Info */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <h1 className="text-3xl font-bold flex items-center">
            <MessageCircle className="h-8 w-8 mr-3" />
            Messages
          </h1>
          {assignedDoctor ? (
            <div className="mt-4 flex items-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                {assignedDoctor.photoURL ? (
                  <img 
                    src={assignedDoctor.photoURL} 
                    alt={`Dr. ${assignedDoctor.lastName}`}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-xl">
                    {assignedDoctor.firstName[0]}{assignedDoctor.lastName[0]}
                  </span>
                )}
              </div>
              <div className="ml-4">
                <p className="font-medium">Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}</p>
                <p className="text-sm text-blue-100">{assignedDoctor.specialization}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-blue-100">No doctor assigned yet</p>
          )}
        </div>

        {/* Messages Container */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === auth.currentUser?.uid
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.senderId === auth.currentUser?.uid
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No messages yet</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 p-4">
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !assignedDoctor}
                className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-600 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5 mr-2" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 