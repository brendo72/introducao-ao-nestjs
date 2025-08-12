import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./users.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

// Mock do PrismaService
// Usamos jest.fn() para criar funções falsas que podemos controlar nos testes
const mockPrisma = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
};

describe("UsersService", () => {
  let service: UserService;

  // Antes de cada teste, montamos o módulo de teste do NestJS
  // e substituímos o PrismaService real pelo mock
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  // --- CREATE ---
  it("deve criar um usuário", async () => {
    const dto = { name: "Jonas", email: "jonas@example.com", password: "123" };
    mockPrisma.user.create.mockResolvedValue(dto);

    const result = await service.create(dto as any);

    expect(result).toEqual(dto);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: dto });
  });

  // --- FIND ALL ---
  it("deve retornar todos os usuarios", async () => {
    const users = [
      { id: "1", name: "Jonas" },
      { id: "2", name: "Maria" },
    ];
    mockPrisma.user.findMany.mockResolvedValue(users);

    const result = await service.findAll();

    expect(result).toEqual(users);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  //    FIND UNIQUE (ENCONTRA)
  it("deve retornar um usuário pelo ID", async () => {
    const user = { id: "1", name: "Jonas" };
    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await service.findOne("1");

    expect(result).toEqual(user);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "1" } });
  });

  // --- FIND UNIQUE (NÃO ENCONTRA) ---
  it("deve lançar erro se o usuário não for encontrado", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne("99")).rejects.toThrow(NotFoundException);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "99" } });
  });

  // --- UPDATE (ENCONTRA E ATUALIZA) ---
  it("deve atualizar um usuário", async () => {
    const updatedUser = { id: "1", name: "Jonas Atualizado" };

    // Simula que o usuário existe antes da atualização
    mockPrisma.user.findUnique.mockResolvedValue(updatedUser);
    // Simula o retorno da atualização
    mockPrisma.user.update.mockResolvedValue(updatedUser);

    const result = await service.update("1", { name: "Jonas Atualizado" } as any);

    expect(result).toEqual(updatedUser);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "1" },
      data: { name: "Jonas Atualizado" },
    });
  });

  // --- UPDATE (NÃO ENCONTRA) ---
  it("deve lançar erro ao tentar atualizar um usuário inexistente", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.update("99", { name: "Novo Nome" } as any)
    ).rejects.toThrow(NotFoundException);
  });

  // --- DELETE (ENCONTRA E REMOVE) ---
 it("deve deletar um usuário", async () => {
    const user = { id: "1", name: "Jonas" };
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.delete.mockResolvedValue(user);

    const result = await service.remove("1");
    expect(result).toEqual(user);
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "1" } });
  });
  // --- DELETE (NÃO ENCONTRA) ---
  it("deve lançar erro ao tentar deletar um usuário inexistente", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.remove("99")).rejects.toThrow(NotFoundException);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "99" } });
  });
});
