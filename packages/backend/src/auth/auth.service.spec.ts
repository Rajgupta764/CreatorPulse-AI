import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let authService: AuthService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn().mockReturnValue("test-jwt-token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("creates a new user and returns profile", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        displayName: "Test User",
        tier: "free",
        dailyLimit: 3,
      });

      const result = await authService.register({
        email: "test@example.com",
        password: "password123",
        displayName: "Test User",
      });

      expect(result.user.id).toBe("uuid-1");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.tier).toBe("free");
      expect(result.user.dailyLimit).toBe(3);
      expect(result.access_token).toBe("test-jwt-token");
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it("hashes the password with bcrypt", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        displayName: null,
        tier: "free",
        dailyLimit: 3,
      });

      await authService.register({
        email: "test@example.com",
        password: "password123",
      });

      const createData = mockPrisma.user.create.mock.calls[0][0].data;
      expect(createData.passwordHash).not.toBe("password123");
      expect(createData.passwordHash).toHaveLength(60);
    });

    it("throws ConflictException for duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "existing-id",
        email: "test@example.com",
      });

      await expect(
        authService.register({
          email: "test@example.com",
          password: "password123",
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("returns token and user on valid credentials", async () => {
      const passwordHash = await bcrypt.hash("password123", 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        passwordHash,
        displayName: "Test User",
        tier: "free",
        dailyLimit: 3,
      });

      const result = await authService.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result.access_token).toBe("test-jwt-token");
      expect(result.user.id).toBe("uuid-1");
      expect(result.user.email).toBe("test@example.com");
    });

    it("throws UnauthorizedException for wrong email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "wrong@example.com",
          password: "password123",
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("throws UnauthorizedException for wrong password", async () => {
      const passwordHash = await bcrypt.hash("correctpassword", 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        passwordHash,
      });

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrongpassword",
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("getProfile", () => {
    it("returns user profile when found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "uuid-1",
        email: "test@example.com",
        displayName: "Test User",
        tier: "free",
        dailyLimit: 3,
      });

      const result = await authService.getProfile("uuid-1");
      expect(result.id).toBe("uuid-1");
      expect(result.email).toBe("test@example.com");
    });

    it("throws UnauthorizedException when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.getProfile("nonexistent")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
