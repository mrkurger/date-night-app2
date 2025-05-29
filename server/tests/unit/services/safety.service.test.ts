// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the safety service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_CHECKIN_DATA: Mock check-in data for testing
//   Related to: server/services/safety.service.js
// ===================================================

import mongoose from 'mongoose';
import SafetyService from '../../../services/safety.service.js';
import SafetyCheckin from '../../../models/safety-checkin.model.js';
import User from '../../../models/user.model.js';
import { AppError } from '../../../middleware/errorHandler.js';
import { setupTestDB, teardownTestDB, clearDatabase } from '../../setup.ts';

describe('Safety Service', () => {
  // Setup test data
  const testUserId = new mongoose.Types.ObjectId();
  const testMeetingWithId = new mongoose.Types.ObjectId();

  const now = new Date();
  const startTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  const expectedEndTime = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now

  const MOCK_CHECKIN_DATA = {
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

  const MOCK_USER_DATA = {
    _id: testUserId,
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123', // Add password to satisfy validation
    safetySettings: {
      emergencyContacts: [
        {
          name: 'Emergency Contact 1',
          phone: '+4798765432',
          email: 'emergency1@example.com',
          relationship: 'Friend',
        },
        {
          name: 'Emergency Contact 2',
          phone: '+4798765433',
          email: 'emergency2@example.com',
          relationship: 'Family',
        },
      ],
    },
  };

  // Create a new instance of SafetyService for each test
  let safetyService;

  // Setup and teardown for all tests
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  // Setup for each test
  beforeEach(() => {
    safetyService = new SafetyService();
  });

  // Clear database between tests
  afterEach(async () => {
    await clearDatabase();
  });

  describe('Safety Plan Methods', () => {
    it('should throw not implemented error for createSafetyPlan', async () => {
      await expect(safetyService.createSafetyPlan()).rejects.toThrow(
        new AppError('createSafetyPlan not implemented', 501)
      );
    });

    it('should throw not implemented error for updateSafetyPlan', async () => {
      await expect(safetyService.updateSafetyPlan()).rejects.toThrow(
        new AppError('updateSafetyPlan not implemented', 501)
      );
    });

    it('should throw not implemented error for deleteSafetyPlan', async () => {
      await expect(safetyService.deleteSafetyPlan()).rejects.toThrow(
        new AppError('deleteSafetyPlan not implemented', 501)
      );
    });

    it('should return empty array for getSafetyPlans', async () => {
      const result = await safetyService.getSafetyPlans();
      expect(result).toEqual([]);
    });
  });

  describe('Check-in Methods', () => {
    describe('createCheckin', () => {
      it('should create a new check-in', async () => {
        const result = await safetyService.createCheckin(MOCK_CHECKIN_DATA, testUserId);

        // Verify the result
        expect(result).toBeDefined();
        expect(result.user.toString()).toBe(testUserId.toString());
        expect(result.meetingWith.toString()).toBe(testMeetingWithId.toString());
        expect(result.clientName).toBe(MOCK_CHECKIN_DATA.clientName);
        expect(result.clientContact).toBe(MOCK_CHECKIN_DATA.clientContact);
        expect(result.location.coordinates).toEqual(MOCK_CHECKIN_DATA.location.coordinates);
        expect(result.startTime).toEqual(MOCK_CHECKIN_DATA.startTime);
        expect(result.expectedEndTime).toEqual(MOCK_CHECKIN_DATA.expectedEndTime);
        expect(result.status).toBe('scheduled'); // Default status

        // Verify the check-in was saved to the database
        const savedCheckin = await SafetyCheckin.findById(result._id);
        expect(savedCheckin).toBeDefined();
        expect(savedCheckin.user.toString()).toBe(testUserId.toString());
      });
    });

    describe('updateCheckin', () => {
      it('should update an existing check-in', async () => {
        // Create a check-in
        const checkin = new SafetyCheckin({ ...MOCK_CHECKIN_DATA, user: testUserId });
        const savedCheckin = await checkin.save();

        // Update data
        const updateData = {
          clientName: 'Updated Client Name',
          safetyNotes: 'Updated safety notes',
        };

        // Update the check-in
        const result = await safetyService.updateCheckin(savedCheckin._id, updateData, testUserId);

        // Verify the result
        expect(result).toBeDefined();
        expect(result.clientName).toBe(updateData.clientName);
        expect(result.safetyNotes).toBe(updateData.safetyNotes);
        expect(result.user.toString()).toBe(testUserId.toString()); // Unchanged

        // Verify the check-in was updated in the database
        const updatedCheckin = await SafetyCheckin.findById(savedCheckin._id);
        expect(updatedCheckin.clientName).toBe(updateData.clientName);
        expect(updatedCheckin.safetyNotes).toBe(updateData.safetyNotes);
      });

      it('should throw error if check-in not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        await expect(safetyService.updateCheckin(nonExistentId, {}, testUserId)).rejects.toThrow(
          new AppError('Checkin not found', 404)
        );
      });

      it('should throw error if user does not own the check-in', async () => {
        // Create a check-in owned by a different user
        const differentUserId = new mongoose.Types.ObjectId();
        const checkin = new SafetyCheckin({ ...MOCK_CHECKIN_DATA, user: differentUserId });
        const savedCheckin = await checkin.save();

        // Try to update the check-in as a different user
        await expect(safetyService.updateCheckin(savedCheckin._id, {}, testUserId)).rejects.toThrow(
          new AppError('Checkin not found', 404)
        );
      });
    });

    describe('deleteCheckin', () => {
      it('should delete an existing check-in', async () => {
        // Create a check-in
        const checkin = new SafetyCheckin({ ...MOCK_CHECKIN_DATA, user: testUserId });
        const savedCheckin = await checkin.save();

        // Delete the check-in
        await safetyService.deleteCheckin(savedCheckin._id, testUserId);

        // Verify the check-in was deleted from the database
        const deletedCheckin = await SafetyCheckin.findById(savedCheckin._id);
        expect(deletedCheckin).toBeNull();
      });

      it('should throw error if check-in not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        await expect(safetyService.deleteCheckin(nonExistentId, testUserId)).rejects.toThrow(
          new AppError('Checkin not found', 404)
        );
      });

      it('should throw error if user does not own the check-in', async () => {
        // Create a check-in owned by a different user
        const differentUserId = new mongoose.Types.ObjectId();
        const checkin = new SafetyCheckin({ ...MOCK_CHECKIN_DATA, user: differentUserId });
        const savedCheckin = await checkin.save();

        // Try to delete the check-in as a different user
        await expect(safetyService.deleteCheckin(savedCheckin._id, testUserId)).rejects.toThrow(
          new AppError('Checkin not found', 404)
        );
      });
    });

    describe('getCheckins', () => {
      it('should get all check-ins for a user', async () => {
        // Create multiple check-ins for the user
        const checkin1 = new SafetyCheckin({ ...MOCK_CHECKIN_DATA, user: testUserId });
        await checkin1.save();

        const checkin2 = new SafetyCheckin({
          ...MOCK_CHECKIN_DATA,
          user: testUserId,
          clientName: 'Another Client',
        });
        await checkin2.save();

        // Create a check-in for a different user
        const differentUserId = new mongoose.Types.ObjectId();
        const checkin3 = new SafetyCheckin({ ...MOCK_CHECKIN_DATA, user: differentUserId });
        await checkin3.save();

        // Get check-ins for the user
        const result = await safetyService.getCheckins(testUserId);

        // Verify the result
        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[0].user.toString()).toBe(testUserId.toString());
        expect(result[1].user.toString()).toBe(testUserId.toString());

        // Verify the check-ins are the correct ones
        const clientNames = result.map(c => c.clientName);
        expect(clientNames).toContain(MOCK_CHECKIN_DATA.clientName);
        expect(clientNames).toContain('Another Client');
      });

      it('should return empty array if user has no check-ins', async () => {
        const result = await safetyService.getCheckins(testUserId);
        expect(result).toEqual([]);
      });
    });

    describe('getTrustedContacts', () => {
      it('should get trusted contacts for a user', async () => {
        // Create a user with emergency contacts
        const user = new User(MOCK_USER_DATA);
        await user.save();

        // Get trusted contacts
        const result = await safetyService.getTrustedContacts(testUserId);

        // Verify the result
        expect(result).toBeDefined();
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Emergency Contact 1');
        expect(result[1].name).toBe('Emergency Contact 2');
      });

      it('should return empty array if user has no emergency contacts', async () => {
        // Create a user without emergency contacts
        const user = new User({
          _id: testUserId,
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123', // Add required password field
          // No safetySettings
        });
        await user.save();

        // Get trusted contacts
        const result = await safetyService.getTrustedContacts(testUserId);

        // Verify the result
        expect(result).toEqual([]);
      });

      it('should return empty array if user not found', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const result = await safetyService.getTrustedContacts(nonExistentUserId);
        expect(result).toEqual([]);
      });
    });

    describe('handleMissedCheckin', () => {
      it('should mark a check-in as missed', async () => {
        // Create a check-in with active status
        const checkin = new SafetyCheckin({
          ...MOCK_CHECKIN_DATA,
          user: testUserId,
          status: 'active',
        });
        const savedCheckin = await checkin.save();

        // Mock the markAsMissed method
        const markAsMissedSpy = jest
          .spyOn(savedCheckin, 'markAsMissed')
          .mockResolvedValue(savedCheckin);

        // Mock the findById method to return our saved check-in with the spy
        jest.spyOn(SafetyCheckin, 'findById').mockResolvedValue(savedCheckin);

        // Handle missed check-in
        await safetyService.handleMissedCheckin(savedCheckin._id);

        // Verify markAsMissed was called
        expect(markAsMissedSpy).toHaveBeenCalled();

        // Restore mocks
        markAsMissedSpy.mockRestore();
        SafetyCheckin.findById.mockRestore();
      });

      it('should throw error if check-in not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        // Mock the findById method to return null
        jest.spyOn(SafetyCheckin, 'findById').mockResolvedValue(null);

        await expect(safetyService.handleMissedCheckin(nonExistentId)).rejects.toThrow(
          new AppError('Checkin not found', 404)
        );

        // Restore mock
        SafetyCheckin.findById.mockRestore();
      });
    });
  });
});
