import { describe, it, expect } from 'vitest';
import { isOwnedByActor, assertOwnership } from '@/shared/authorization/ownership';
import { AppError } from '@/shared/errors/AppError';

describe('ownership', () => {
  describe('isOwnedByActor', () => {
    it('should own a personal record when userId matches', () => {
      expect(isOwnedByActor({ userId: 'u1', organizationId: null }, 'u1', [])).toBe(true);
    });

    it('should not own a personal record belonging to another user', () => {
      expect(isOwnedByActor({ userId: 'u2', organizationId: null }, 'u1', [])).toBe(false);
    });

    it('should own an organization record when the actor is a member', () => {
      expect(isOwnedByActor({ userId: null, organizationId: 'org-1' }, 'u1', ['org-1'])).toBe(true);
    });

    it('should not own an organization record when the actor is not a member', () => {
      expect(isOwnedByActor({ userId: null, organizationId: 'org-1' }, 'u1', ['org-2'])).toBe(false);
    });
  });

  describe('assertOwnership', () => {
    it('should throw 404 when the record is null', () => {
      expect(() => assertOwnership(null, 'u1', [])).toThrow(AppError);
    });

    it('should throw 404 when the actor does not own the record', () => {
      expect(() => assertOwnership({ userId: 'u2', organizationId: null }, 'u1', [])).toThrow(AppError);
    });

    it('should not throw when the actor owns the record', () => {
      expect(() => assertOwnership({ userId: 'u1', organizationId: null }, 'u1', [])).not.toThrow();
    });
  });
});
