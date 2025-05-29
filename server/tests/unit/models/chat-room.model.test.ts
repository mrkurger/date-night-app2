// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the chat room model
//
// COMMON CUSTOMIZATIONS:
// - TEST_USER_DATA: Test user data (default: imported from helpers)
//   Related to: server/tests/helpers.js:TEST_USER_DATA
// ===================================================

import mongoose from 'mongoose';
import ChatRoom from '../../../models/chat-room.model.js';
import ChatMessage from '../../../models/chat-message.model.js';
import User from '../../../models/user.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';
import { TEST_USER_DATA } from '../../helpers.ts';

describe('ChatRoom Model', () => {
  let user1;
  let user2;
  let user3;

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  // Create test users before each test
  beforeEach(async () => {
    // Create first user
    const user1Data = new User({
      ...TEST_USER_DATA,
      username: 'user1',
      email: 'user1@example.com',
    });
    user1 = await user1Data.save();

    // Create second user
    const user2Data = new User({
      ...TEST_USER_DATA,
      username: 'user2',
      email: 'user2@example.com',
    });
    user2 = await user2Data.save();

    // Create third user
    const user3Data = new User({
      ...TEST_USER_DATA,
      username: 'user3',
      email: 'user3@example.com',
    });
    user3 = await user3Data.save();
  });

  describe('Basic Validation', () => {
    it('should create a new direct chat room successfully', async () => {
      const roomData = {
        type: 'direct',
        participants: [{ user: user1._id }, { user: user2._id }],
        createdBy: user1._id,
      };

      const chatRoom = new ChatRoom(roomData);
      const savedRoom = await chatRoom.save();

      // Verify the saved room
      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.type).toBe('direct');
      expect(savedRoom.participants.length).toBe(2);
      expect(savedRoom.participants[0].user.toString()).toBe(user1._id.toString());
      expect(savedRoom.participants[1].user.toString()).toBe(user2._id.toString());
      expect(savedRoom.participants[0].role).toBe('member');
      expect(savedRoom.participants[0].joinedAt).toBeDefined();
      expect(savedRoom.createdBy.toString()).toBe(user1._id.toString());
      expect(savedRoom.isActive).toBe(true);
      expect(savedRoom.encryptionEnabled).toBe(true);
      expect(savedRoom.createdAt).toBeDefined();
      expect(savedRoom.updatedAt).toBeDefined();
    });

    it('should create a new group chat room successfully', async () => {
      const roomData = {
        name: 'Test Group',
        type: 'group',
        participants: [
          { user: user1._id, role: 'admin' },
          { user: user2._id },
          { user: user3._id },
        ],
        createdBy: user1._id,
      };

      const chatRoom = new ChatRoom(roomData);
      const savedRoom = await chatRoom.save();

      // Verify the saved room
      expect(savedRoom._id).toBeDefined();
      expect(savedRoom.name).toBe('Test Group');
      expect(savedRoom.type).toBe('group');
      expect(savedRoom.participants.length).toBe(3);
      expect(savedRoom.participants[0].role).toBe('admin');
      expect(savedRoom.participants[1].role).toBe('member');
    });

    it('should create room with empty participants array', async () => {
      // Note: The model doesn't actually require participants at creation time,
      // but in practice, rooms should have participants
      const roomWithoutParticipants = new ChatRoom({
        type: 'direct',
        createdBy: user1._id,
      });

      const savedRoom = await roomWithoutParticipants.save();
      expect(savedRoom.participants).toEqual([]);
    });

    it('should validate room type', async () => {
      const roomWithInvalidType = new ChatRoom({
        type: 'invalid-type',
        participants: [{ user: user1._id }, { user: user2._id }],
        createdBy: user1._id,
      });

      // Expect validation to fail
      await expect(roomWithInvalidType.save()).rejects.toThrow();
    });

    it('should validate participant role', async () => {
      const roomWithInvalidRole = new ChatRoom({
        type: 'group',
        participants: [{ user: user1._id, role: 'invalid-role' }, { user: user2._id }],
        createdBy: user1._id,
      });

      // Expect validation to fail
      await expect(roomWithInvalidRole.save()).rejects.toThrow();
    });
  });

  describe('Virtual Properties', () => {
    it('should correctly identify direct message rooms', async () => {
      const directRoom = new ChatRoom({
        type: 'direct',
        participants: [{ user: user1._id }, { user: user2._id }],
        createdBy: user1._id,
      });

      const savedRoom = await directRoom.save();

      expect(savedRoom.isDirect).toBe(true);
      expect(savedRoom.isGroup).toBe(false);
      expect(savedRoom.isAdChat).toBe(false);
    });

    it('should correctly identify group chat rooms', async () => {
      const groupRoom = new ChatRoom({
        name: 'Test Group',
        type: 'group',
        participants: [
          { user: user1._id, role: 'admin' },
          { user: user2._id },
          { user: user3._id },
        ],
        createdBy: user1._id,
      });

      const savedRoom = await groupRoom.save();

      expect(savedRoom.isDirect).toBe(false);
      expect(savedRoom.isGroup).toBe(true);
      expect(savedRoom.isAdChat).toBe(false);
    });

    it('should correctly identify ad chat rooms', async () => {
      const adRoom = new ChatRoom({
        type: 'ad',
        participants: [{ user: user1._id }, { user: user2._id, role: 'admin' }],
        ad: new mongoose.Types.ObjectId(),
        createdBy: user1._id,
      });

      const savedRoom = await adRoom.save();

      expect(savedRoom.isDirect).toBe(false);
      expect(savedRoom.isGroup).toBe(false);
      expect(savedRoom.isAdChat).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    let testRoom;

    beforeEach(async () => {
      // Create a test room
      testRoom = await ChatRoom.create({
        type: 'group',
        name: 'Test Room',
        participants: [{ user: user1._id, role: 'admin' }, { user: user2._id }],
        createdBy: user1._id,
      });
    });

    it('should add a participant to the room', async () => {
      // Initially room has 2 participants
      expect(testRoom.participants.length).toBe(2);

      // Add user3 to the room
      await testRoom.addParticipant(user3._id);

      // Room should now have 3 participants
      expect(testRoom.participants.length).toBe(3);
      expect(testRoom.participants[2].user.toString()).toBe(user3._id.toString());
      expect(testRoom.participants[2].role).toBe('member');
      expect(testRoom.participants[2].joinedAt).toBeDefined();
    });

    it('should not add a participant if already in the room', async () => {
      // Initially room has 2 participants
      expect(testRoom.participants.length).toBe(2);

      // Try to add user1 again
      await testRoom.addParticipant(user1._id);

      // Room should still have 2 participants
      expect(testRoom.participants.length).toBe(2);
    });

    it('should add a participant with specified role', async () => {
      // Add user3 as admin
      await testRoom.addParticipant(user3._id, 'admin');

      // Find the added participant
      const participant = testRoom.participants.find(
        p => p.user.toString() === user3._id.toString()
      );

      expect(participant).toBeDefined();
      expect(participant.role).toBe('admin');
    });

    it('should remove a participant from the room', async () => {
      // Initially room has 2 participants
      expect(testRoom.participants.length).toBe(2);

      // Remove user2 from the room
      await testRoom.removeParticipant(user2._id);

      // Room should now have 1 participant
      expect(testRoom.participants.length).toBe(1);
      expect(testRoom.participants[0].user.toString()).toBe(user1._id.toString());
    });

    it('should update last read timestamp for a participant', async () => {
      // Initially lastRead is undefined
      expect(testRoom.participants[0].lastRead).toBeUndefined();

      // Update last read for user1
      await testRoom.updateLastRead(user1._id);

      // lastRead should now be defined
      expect(testRoom.participants[0].lastRead).toBeDefined();
    });

    it('should update last activity timestamp', async () => {
      // Store initial lastActivity
      const initialLastActivity = testRoom.lastActivity;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update last activity
      await testRoom.updateLastActivity();

      // lastActivity should be updated
      expect(testRoom.lastActivity).not.toEqual(initialLastActivity);
    });

    it('should update last message', async () => {
      // Create a test message
      const message = await ChatMessage.create({
        sender: user1._id,
        recipient: user2._id,
        roomId: testRoom._id.toString(),
        message: 'Test message',
      });

      // Update last message
      await testRoom.updateLastMessage(message._id);

      // lastMessage should be updated
      expect(testRoom.lastMessage.toString()).toBe(message._id.toString());
      expect(testRoom.lastActivity).toBeDefined();
    });
  });

  describe('Static Methods', () => {
    it('should find or create a direct room between two users', async () => {
      // Initially no rooms exist
      const initialRoomCount = await ChatRoom.countDocuments();
      expect(initialRoomCount).toBe(0);

      // Find or create a direct room
      const room = await ChatRoom.findOrCreateDirectRoom(user1._id, user2._id);

      // Room should be created
      expect(room).toBeDefined();
      expect(room.type).toBe('direct');
      expect(room.participants.length).toBe(2);

      // Calling again should return the same room
      const sameRoom = await ChatRoom.findOrCreateDirectRoom(user1._id, user2._id);
      expect(sameRoom._id.toString()).toBe(room._id.toString());

      // Room count should still be 1
      const finalRoomCount = await ChatRoom.countDocuments();
      expect(finalRoomCount).toBe(1);
    });

    it('should find or create an ad room', async () => {
      // Create a fake ad ID
      const adId = new mongoose.Types.ObjectId();

      // Initially no rooms exist
      const initialRoomCount = await ChatRoom.countDocuments();
      expect(initialRoomCount).toBe(0);

      // Find or create an ad room
      const room = await ChatRoom.findOrCreateAdRoom(user1._id, adId, user2._id);

      // Room should be created
      expect(room).toBeDefined();
      expect(room.type).toBe('ad');
      expect(room.ad.toString()).toBe(adId.toString());
      expect(room.participants.length).toBe(2);
      expect(room.participants[1].role).toBe('admin'); // Advertiser should be admin

      // Calling again should return the same room
      const sameRoom = await ChatRoom.findOrCreateAdRoom(user1._id, adId, user2._id);
      expect(sameRoom._id.toString()).toBe(room._id.toString());

      // Room count should still be 1
      const finalRoomCount = await ChatRoom.countDocuments();
      expect(finalRoomCount).toBe(1);
    });

    it('should get rooms for a user', async () => {
      // Create multiple rooms
      await ChatRoom.create([
        {
          type: 'direct',
          participants: [{ user: user1._id }, { user: user2._id }],
          createdBy: user1._id,
          lastActivity: new Date(Date.now() - 1000), // Older
        },
        {
          type: 'group',
          name: 'Group Chat',
          participants: [{ user: user1._id }, { user: user2._id }, { user: user3._id }],
          createdBy: user2._id,
          lastActivity: new Date(), // Newer
        },
        {
          type: 'direct',
          participants: [{ user: user2._id }, { user: user3._id }],
          createdBy: user2._id,
        },
      ]);

      // Get rooms for user1
      const user1Rooms = await ChatRoom.getRoomsForUser(user1._id);

      // Should have 2 rooms
      expect(user1Rooms.length).toBe(2);

      // First room should be the group chat (newer lastActivity)
      expect(user1Rooms[0].type).toBe('group');
      expect(user1Rooms[0].name).toBe('Group Chat');

      // Second room should be the direct chat
      expect(user1Rooms[1].type).toBe('direct');

      // Get rooms for user3
      const user3Rooms = await ChatRoom.getRoomsForUser(user3._id);

      // Should have 2 rooms
      expect(user3Rooms.length).toBe(2);
    });

    it('should not return inactive rooms', async () => {
      // Create an active and inactive room
      await ChatRoom.create([
        {
          type: 'direct',
          participants: [{ user: user1._id }, { user: user2._id }],
          createdBy: user1._id,
          isActive: true,
        },
        {
          type: 'direct',
          participants: [{ user: user1._id }, { user: user3._id }],
          createdBy: user1._id,
          isActive: false,
        },
      ]);

      // Get rooms for user1
      const user1Rooms = await ChatRoom.getRoomsForUser(user1._id);

      // Should have only 1 active room
      expect(user1Rooms.length).toBe(1);

      // Check that the active room has user2 as a participant
      // The user objects are populated, so we need to check the _id
      const participantIds = user1Rooms[0].participants.map(p => p.user._id.toString());
      expect(participantIds).toContain(user2._id.toString());
    });
  });
});
