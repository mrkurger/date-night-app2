// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the safety-checkin model
//
// COMMON CUSTOMIZATIONS:
// - TEST_CHECKIN_DATA: Test safety check-in data
//   Related to: server/models/safety-checkin.model.js
// ===================================================

import mongoose from 'mongoose';
import SafetyCheckin from '../../../models/safety-checkin.model.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';

describe('SafetyCheckin Model', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testMeetingWithId = new mongoose.Types.ObjectId();

  // Create dates for testing
  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const expectedEndTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

  const TEST_CHECKIN_DATA = {
    user: testUserId,
    meetingWith: testMeetingWithId,
    clientName: 'Test Client',
    clientContact: '+4712345678',
    location: {
      type: 'Point',
      coordinates: [10.7522, 59.9139], // Oslo
      address: 'Test Address 123',
      locationName: 'Test Hotel',
      city: 'Oslo',
      county: 'Oslo',
    },
    startTime: startTime,
    expectedEndTime: expectedEndTime,
    safetyNotes: 'Meeting in public place. Will check in every hour.',
    safetyCode: 'SAFE123',
    distressCode: 'HELP123',
    checkInMethod: 'app',
    emergencyContacts: [
      {
        name: 'Emergency Contact 1',
        phone: '+4798765432',
        email: 'emergency1@example.com',
        relationship: 'Friend',
      },
    ],
    autoCheckInSettings: {
      enabled: true,
      intervalMinutes: 30,
      missedCheckInsBeforeAlert: 2,
    },
  };

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

  describe('Basic Validation', () => {
    it('should create a new safety check-in successfully', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      // Verify the saved check-in
      expect(savedCheckin._id).toBeDefined();
      expect(savedCheckin.user.toString()).toBe(testUserId.toString());
      expect(savedCheckin.meetingWith.toString()).toBe(testMeetingWithId.toString());
      expect(savedCheckin.clientName).toBe(TEST_CHECKIN_DATA.clientName);
      expect(savedCheckin.clientContact).toBe(TEST_CHECKIN_DATA.clientContact);
      expect(savedCheckin.location.coordinates).toEqual(TEST_CHECKIN_DATA.location.coordinates);
      expect(savedCheckin.location.address).toBe(TEST_CHECKIN_DATA.location.address);
      expect(savedCheckin.location.locationName).toBe(TEST_CHECKIN_DATA.location.locationName);
      expect(savedCheckin.location.city).toBe(TEST_CHECKIN_DATA.location.city);
      expect(savedCheckin.location.county).toBe(TEST_CHECKIN_DATA.location.county);
      expect(savedCheckin.startTime).toEqual(TEST_CHECKIN_DATA.startTime);
      expect(savedCheckin.expectedEndTime).toEqual(TEST_CHECKIN_DATA.expectedEndTime);
      expect(savedCheckin.safetyNotes).toBe(TEST_CHECKIN_DATA.safetyNotes);
      // safetyCode and distressCode are not returned in normal queries (select: false)
      expect(savedCheckin.checkInMethod).toBe(TEST_CHECKIN_DATA.checkInMethod);
      expect(savedCheckin.status).toBe('scheduled'); // Default status
      expect(savedCheckin.checkInReminders).toEqual([]); // Default empty array
      expect(savedCheckin.checkInResponses).toEqual([]); // Default empty array
      expect(savedCheckin.emergencyContacts).toHaveLength(1);
      expect(savedCheckin.emergencyContacts[0].name).toBe(
        TEST_CHECKIN_DATA.emergencyContacts[0].name
      );
      expect(savedCheckin.autoCheckInSettings.enabled).toBe(
        TEST_CHECKIN_DATA.autoCheckInSettings.enabled
      );
      expect(savedCheckin.createdAt).toBeDefined();
      expect(savedCheckin.updatedAt).toBeDefined();
    });

    it('should require user, location coordinates, startTime, and expectedEndTime', async () => {
      const checkinWithoutRequiredFields = new SafetyCheckin({
        clientName: 'Test Client',
      });

      // Expect validation to fail
      await expect(checkinWithoutRequiredFields.save()).rejects.toThrow();
    });

    it('should enforce status enum validation', async () => {
      const checkinWithInvalidStatus = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'invalid-status', // Not in enum: ['scheduled', 'active', 'completed', 'missed', 'emergency']
      });

      // Expect validation to fail
      await expect(checkinWithInvalidStatus.save()).rejects.toThrow();
    });

    it('should enforce checkInMethod enum validation', async () => {
      const checkinWithInvalidMethod = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        checkInMethod: 'invalid-method', // Not in enum: ['app', 'sms', 'email']
      });

      // Expect validation to fail
      await expect(checkinWithInvalidMethod.save()).rejects.toThrow();
    });

    it('should enforce location type enum validation', async () => {
      const checkinWithInvalidLocationType = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        location: {
          ...TEST_CHECKIN_DATA.location,
          type: 'InvalidType', // Not in enum: ['Point']
        },
      });

      // Expect validation to fail
      await expect(checkinWithInvalidLocationType.save()).rejects.toThrow();
    });

    it('should enforce safetyNotes maxlength validation', async () => {
      const checkinWithLongNotes = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        safetyNotes: 'a'.repeat(1001), // Exceeds 1000 character limit
      });

      // Expect validation to fail
      await expect(checkinWithLongNotes.save()).rejects.toThrow();
    });

    it('should trim whitespace from clientName and clientContact', async () => {
      const checkinWithWhitespace = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        clientName: '  Test Client  ',
        clientContact: '  +4712345678  ',
      });

      const savedCheckin = await checkinWithWhitespace.save();
      expect(savedCheckin.clientName).toBe('Test Client');
      expect(savedCheckin.clientContact).toBe('+4712345678');
    });
  });

  describe('Instance Methods', () => {
    it('should start a check-in', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      expect(savedCheckin.status).toBe('scheduled');
      expect(savedCheckin.checkInReminders).toHaveLength(0);

      // Start the check-in
      const startedCheckin = await savedCheckin.startCheckin();

      expect(startedCheckin.status).toBe('active');
      expect(startedCheckin.checkInReminders.length).toBeGreaterThan(0);
      startedCheckin.checkInReminders.forEach(reminder => {
        expect(reminder.scheduledTime).toBeDefined();
        expect(reminder.sent).toBe(false);
      });
    });

    it('should throw error when starting a non-scheduled check-in', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Already active
      });
      const savedCheckin = await checkin.save();

      await expect(savedCheckin.startCheckin()).rejects.toThrow(
        'Check-in must be in scheduled status to start'
      );
    });

    it('should complete a check-in', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Active check-in
      });
      const savedCheckin = await checkin.save();

      expect(savedCheckin.status).toBe('active');
      expect(savedCheckin.actualEndTime).toBeUndefined();

      // Complete the check-in
      const completedCheckin = await savedCheckin.completeCheckin();

      expect(completedCheckin.status).toBe('completed');
      expect(completedCheckin.actualEndTime).toBeDefined();
    });

    it('should throw error when completing a non-active/non-scheduled check-in', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'completed', // Already completed
      });
      const savedCheckin = await checkin.save();

      await expect(savedCheckin.completeCheckin()).rejects.toThrow(
        'Check-in must be in active or scheduled status to complete'
      );
    });

    it('should record a safe response', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Active check-in
      });
      const savedCheckin = await checkin.save();

      expect(savedCheckin.checkInResponses).toHaveLength(0);

      // Record a safe response
      const updatedCheckin = await savedCheckin.recordResponse('safe', [10.7522, 59.9139]);

      expect(updatedCheckin.checkInResponses).toHaveLength(1);
      expect(updatedCheckin.checkInResponses[0].response).toBe('safe');
      expect(updatedCheckin.checkInResponses[0].time).toBeDefined();
      expect(updatedCheckin.checkInResponses[0].location.coordinates).toEqual([10.7522, 59.9139]);
      expect(updatedCheckin.status).toBe('active'); // Status remains active
    });

    it('should record a need_more_time response and extend expected end time', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Active check-in
      });
      const savedCheckin = await checkin.save();

      const originalEndTime = savedCheckin.expectedEndTime;
      expect(savedCheckin.checkInReminders).toHaveLength(0);

      // Record a need_more_time response
      const updatedCheckin = await savedCheckin.recordResponse('need_more_time');

      expect(updatedCheckin.checkInResponses).toHaveLength(1);
      expect(updatedCheckin.checkInResponses[0].response).toBe('need_more_time');

      // Expected end time should be extended by 30 minutes
      expect(updatedCheckin.expectedEndTime.getTime()).toBe(
        originalEndTime.getTime() + 30 * 60 * 1000
      );

      // A new reminder should be added
      expect(updatedCheckin.checkInReminders).toHaveLength(1);
      expect(updatedCheckin.status).toBe('active'); // Status remains active
    });

    it('should record a distress response and update status to emergency', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Active check-in
      });
      const savedCheckin = await checkin.save();

      // Record a distress response
      const updatedCheckin = await savedCheckin.recordResponse('distress');

      expect(updatedCheckin.checkInResponses).toHaveLength(1);
      expect(updatedCheckin.checkInResponses[0].response).toBe('distress');
      expect(updatedCheckin.status).toBe('emergency'); // Status changed to emergency
    });

    it('should throw error when recording response for a non-active check-in', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'scheduled', // Not active
      });
      const savedCheckin = await checkin.save();

      await expect(savedCheckin.recordResponse('safe')).rejects.toThrow(
        'Check-in must be in active status to record a response'
      );
    });

    it('should mark a check-in as missed', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Active check-in
      });
      const savedCheckin = await checkin.save();

      // Mark as missed
      const missedCheckin = await savedCheckin.markAsMissed();

      expect(missedCheckin.status).toBe('missed');
    });

    it('should throw error when marking a non-active check-in as missed', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'scheduled', // Not active
      });
      const savedCheckin = await checkin.save();

      await expect(savedCheckin.markAsMissed()).rejects.toThrow(
        'Check-in must be in active status to mark as missed'
      );
    });

    it('should trigger emergency protocol', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      // Trigger emergency
      const emergencyCheckin = await savedCheckin.triggerEmergency();

      expect(emergencyCheckin.status).toBe('emergency');
    });

    it('should notify emergency contacts', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'emergency', // Emergency status
        emergencyContacts: [
          {
            name: 'Emergency Contact 1',
            phone: '+4798765432',
            email: 'emergency1@example.com',
            relationship: 'Friend',
            notified: false,
          },
          {
            name: 'Emergency Contact 2',
            phone: '+4798765433',
            email: 'emergency2@example.com',
            relationship: 'Family',
            notified: false,
          },
        ],
      });
      const savedCheckin = await checkin.save();

      // Notify emergency contacts
      const updatedCheckin = await savedCheckin.notifyEmergencyContacts();

      expect(updatedCheckin.emergencyContacts).toHaveLength(2);
      updatedCheckin.emergencyContacts.forEach(contact => {
        expect(contact.notified).toBe(true);
        expect(contact.notifiedAt).toBeDefined();
      });
    });

    it('should throw error when notifying contacts for a non-emergency/non-missed check-in', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Not emergency or missed
      });
      const savedCheckin = await checkin.save();

      await expect(savedCheckin.notifyEmergencyContacts()).rejects.toThrow(
        'Check-in must be in emergency or missed status to notify contacts'
      );
    });

    it('should add an emergency contact', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      expect(savedCheckin.emergencyContacts).toHaveLength(1);

      // Add a new emergency contact
      const newContact = {
        name: 'New Emergency Contact',
        phone: '+4798765433',
        email: 'newemergency@example.com',
        relationship: 'Colleague',
      };

      const updatedCheckin = await savedCheckin.addEmergencyContact(newContact);

      expect(updatedCheckin.emergencyContacts).toHaveLength(2);
      expect(updatedCheckin.emergencyContacts[1].name).toBe(newContact.name);
      expect(updatedCheckin.emergencyContacts[1].phone).toBe(newContact.phone);
      expect(updatedCheckin.emergencyContacts[1].email).toBe(newContact.email);
      expect(updatedCheckin.emergencyContacts[1].relationship).toBe(newContact.relationship);
    });

    it('should remove an emergency contact', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      // Add a second emergency contact
      const newContact = {
        name: 'Second Emergency Contact',
        phone: '+4798765433',
        email: 'second@example.com',
        relationship: 'Colleague',
      };
      const updatedCheckin = await savedCheckin.addEmergencyContact(newContact);
      expect(updatedCheckin.emergencyContacts).toHaveLength(2);

      // Remove the first emergency contact
      const contactIdToRemove = updatedCheckin.emergencyContacts[0]._id;
      const afterRemoval = await updatedCheckin.removeEmergencyContact(contactIdToRemove);

      expect(afterRemoval.emergencyContacts).toHaveLength(1);
      expect(afterRemoval.emergencyContacts[0].name).toBe('Second Emergency Contact');
    });

    it('should update check-in details', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      // Update details
      const updates = {
        clientName: 'Updated Client Name',
        clientContact: 'Updated Contact',
        safetyNotes: 'Updated safety notes',
        checkInMethod: 'sms',
      };

      const updatedCheckin = await savedCheckin.updateDetails(updates);

      expect(updatedCheckin.clientName).toBe(updates.clientName);
      expect(updatedCheckin.clientContact).toBe(updates.clientContact);
      expect(updatedCheckin.safetyNotes).toBe(updates.safetyNotes);
      expect(updatedCheckin.checkInMethod).toBe(updates.checkInMethod);
    });

    it('should throw error when updating a non-scheduled check-in', async () => {
      const checkin = new SafetyCheckin({
        ...TEST_CHECKIN_DATA,
        status: 'active', // Not scheduled
      });
      const savedCheckin = await checkin.save();

      const updates = {
        clientName: 'Updated Client Name',
      };

      await expect(savedCheckin.updateDetails(updates)).rejects.toThrow(
        'Only scheduled check-ins can be updated'
      );
    });
  });

  describe('Static Methods', () => {
    // Setup for static method tests
    const setupCheckins = async (): Promise<void> => {
      const user1Id = new mongoose.Types.ObjectId();
      const user2Id = new mongoose.Types.ObjectId();

      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);

      // Create multiple check-ins for testing
      await SafetyCheckin.create([
        {
          user: user1Id,
          location: {
            type: 'Point',
            coordinates: [10.7522, 59.9139],
          },
          startTime: twoHoursAgo,
          expectedEndTime: oneHourFromNow,
          status: 'active',
          checkInReminders: [
            {
              scheduledTime: oneHourAgo,
              sent: true,
              sentAt: oneHourAgo,
            },
            {
              scheduledTime: now, // Due now, not sent yet
              sent: false,
            },
          ],
        },
        {
          user: user1Id,
          location: {
            type: 'Point',
            coordinates: [5.3221, 60.3913],
          },
          startTime: oneHourFromNow,
          expectedEndTime: threeHoursFromNow,
          status: 'scheduled',
        },
        {
          user: user1Id,
          location: {
            type: 'Point',
            coordinates: [10.3951, 63.4305],
          },
          startTime: twoHoursAgo,
          expectedEndTime: oneHourAgo, // Past expected end time
          status: 'active',
        },
        {
          user: user2Id,
          location: {
            type: 'Point',
            coordinates: [5.7331, 58.9701],
          },
          startTime: twoHoursAgo,
          expectedEndTime: twoHoursFromNow,
          status: 'active',
        },
        {
          user: user2Id,
          location: {
            type: 'Point',
            coordinates: [18.9553, 69.6492],
          },
          startTime: twoHoursAgo,
          expectedEndTime: oneHourAgo,
          status: 'missed',
        },
        {
          user: user2Id,
          location: {
            type: 'Point',
            coordinates: [9.082, 58.1599],
          },
          startTime: twoHoursAgo,
          expectedEndTime: oneHourFromNow,
          status: 'emergency',
        },
      ]);

      return { user1Id, user2Id };
    };

    // Mock the populate method since we're not actually populating in tests
    beforeEach(() => {
      jest.spyOn(mongoose.Query.prototype, 'populate').mockImplementation(function () {
        return this;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('findActiveCheckins', () => {
      it('should find all active check-ins', async () => {
        await setupCheckins();

        const activeCheckins = await SafetyCheckin.findActiveCheckins();

        expect(activeCheckins).toHaveLength(3); // 3 active check-ins
        activeCheckins.forEach(checkin => {
          expect(checkin.status).toBe('active');
        });
      });
    });

    describe('findCheckinsRequiringAttention', () => {
      it('should find check-ins requiring attention', async () => {
        await setupCheckins();

        const checkinsRequiringAttention = await SafetyCheckin.findCheckinsRequiringAttention();

        // Should include:
        // 1. Active check-in past expected end time
        // 2. Missed check-in
        // 3. Emergency check-in
        expect(checkinsRequiringAttention).toHaveLength(3);

        const statuses = checkinsRequiringAttention.map(checkin => checkin.status);
        expect(statuses).toContain('active');
        expect(statuses).toContain('missed');
        expect(statuses).toContain('emergency');
      });
    });

    describe('findUpcomingCheckins', () => {
      it('should find upcoming check-ins for a user', async () => {
        const { user1Id } = await setupCheckins();

        const upcomingCheckins = await SafetyCheckin.findUpcomingCheckins(user1Id);

        expect(upcomingCheckins).toHaveLength(1); // 1 scheduled check-in for user1
        expect(upcomingCheckins[0].status).toBe('scheduled');
        expect(upcomingCheckins[0].user.toString()).toBe(user1Id.toString());
      });

      it('should return empty array when user has no upcoming check-ins', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const upcomingCheckins = await SafetyCheckin.findUpcomingCheckins(nonExistentUserId);

        expect(upcomingCheckins).toHaveLength(0);
      });
    });

    describe('findCheckinsWithPendingReminders', () => {
      it('should find check-ins with pending reminders', async () => {
        await setupCheckins();

        const checkinsWithPendingReminders = await SafetyCheckin.findCheckinsWithPendingReminders();

        expect(checkinsWithPendingReminders).toHaveLength(1); // 1 check-in with pending reminder

        // Verify the check-in has a pending reminder
        const checkin = checkinsWithPendingReminders[0];
        expect(checkin.status).toBe('active');

        const pendingReminders = checkin.checkInReminders.filter(
          reminder => !reminder.sent && reminder.scheduledTime <= new Date()
        );
        expect(pendingReminders.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Hooks', () => {
    it('should update updatedAt field on save', async () => {
      const checkin = new SafetyCheckin(TEST_CHECKIN_DATA);
      const savedCheckin = await checkin.save();

      const originalUpdatedAt = savedCheckin.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update the check-in
      savedCheckin.clientName = 'Updated Client Name';
      await savedCheckin.save();

      expect(savedCheckin.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe('Indexes', () => {
    it('should have the expected indexes', async () => {
      const indexes = await SafetyCheckin.collection.indexes();

      // Check for 2dsphere index on location
      const locationIndex = indexes.find(index => index.key.location === '2dsphere');
      expect(locationIndex).toBeDefined();

      // Check for compound index on user, status, and startTime
      const userStatusStartTimeIndex = indexes.find(
        index => index.key.user === 1 && index.key.status === 1 && index.key.startTime === 1
      );
      expect(userStatusStartTimeIndex).toBeDefined();

      // Check for compound index on status and expectedEndTime
      const statusExpectedEndTimeIndex = indexes.find(
        index => index.key.status === 1 && index.key.expectedEndTime === 1
      );
      expect(statusExpectedEndTimeIndex).toBeDefined();
    });
  });
});
