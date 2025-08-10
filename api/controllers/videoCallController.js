import twilio from 'twilio';

const AccessToken = twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

// Generate Twilio access token for video calls
export const getTwilioToken = async (req, res) => {
  try {
    const { roomName, userName } = req.body;

    if (!roomName || !userName) {
      return res.status(400).json({ 
        message: 'Room name and user name are required' 
      });
    }

    // Twilio credentials from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKeySid = process.env.TWILIO_API_KEY_SID;
    const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;

    if (!accountSid || !apiKeySid || !apiKeySecret) {
      return res.status(500).json({ 
        message: 'Twilio credentials not configured' 
      });
    }

    // Create an access token
    const token = new AccessToken(accountSid, apiKeySid, apiKeySecret, {
      identity: userName,
      ttl: 14400, // Token valid for 4 hours (sufficient for video consultations)
    });

    // Create a video grant for this token
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    // Add the video grant to the token
    token.addGrant(videoGrant);

    // Serialize the token to a JWT string
    const jwtToken = token.toJwt();

    res.json({
      success: true,
      token: jwtToken,
      roomName,
      userName
    });

  } catch (error) {
    console.error('Error generating Twilio token:', error);
    res.status(500).json({ 
      message: 'Failed to generate video call token',
      error: error.message 
    });
  }
};

// Get appointment details for video call
export const getAppointmentForVideoCall = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user._id;

    // Here you can add logic to verify the appointment exists and user has access
    // For now, we'll return basic room info
    const roomName = `appointment-${appointmentId}`;
    const userName = req.user.name || `user-${userId}`;

    res.json({
      success: true,
      roomName,
      userName,
      appointmentId
    });

  } catch (error) {
    console.error('Error getting appointment for video call:', error);
    res.status(500).json({ 
      message: 'Failed to get appointment details',
      error: error.message 
    });
  }
};
