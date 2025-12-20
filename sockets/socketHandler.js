module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    // --- CASE A: JOINING ROOMS ---
    // When a user logs in, they join a "room" based on their User ID.
    // This allows you to send notifications to a SPECIFIC person.
    socket.on('join_room', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their personal room`);
    });

    // --- CASE B: DOCTOR UPDATES AVAILABILITY ---
    // 1. Doctor frontend emits this event when they change slots
    socket.on('update_availability', (data) => {
      // 2. Server broadcasts this to everyone looking at appointments
      // This refreshes the calendar for all patients instantly
      socket.broadcast.emit('refresh_slots', data);
    });

    // --- CASE C: NEW APPOINTMENT BOOKED ---
    socket.on('new_appointment', (appointmentData) => {
      const { doctorId, patientName } = appointmentData;
      
      // Send a specific notification ONLY to that Doctor's room
      io.to(doctorId).emit('notification', {
        message: `New appointment request from ${patientName}`,
        type: 'APPOINTMENT_NEW'
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};