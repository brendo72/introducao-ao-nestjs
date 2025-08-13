
import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UserService } from "./users.service";
const mockUserService = {
    findAll: jest.fn(),
    findOne: jest.fn(), 
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

describe("UsersController Tests", () => {
    let controller: UsersController;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UserService, useValue: mockUserService },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    }); // Find All
    it("deve lista de usuários", async () => {
        const users = [
            { name: "Jonas", email: "jonas@gmail.com" },
            { name: "Maria", email: "maria@gmail.com"},
        ]
        mockUserService.findAll.mockResolvedValue(users); // Finge que o service retorna "users"
        const result = await controller.findAll(); // Chama o método do controller
        expect(result).toEqual(users); // Espera que o resultado seja igual ao array "users"
        
    }); //  Find One
    it("deve encontrar um usuário pelo ID", async () => {
        const user = { id: "1", name: "Jonas" };
        mockUserService.findOne.mockResolvedValue(user); // Mock do retorno
        const result = await controller.findOne("1");  // Chama o método
        expect(result).toEqual(user); // Verifica se o retorno bate com o mock
    }); //   Update
    it("deve atualizar um usuário", async () => {
        const updatedUser = { id: "1", name: "Jonas Updated" };
        mockUserService.update.mockResolvedValue(updatedUser);  // Mock de retorno
        const result = await controller.update("1", updatedUser); // Chama o método
        expect(result).toEqual(updatedUser); // Verifica se o retorno é igual ao mock
        expect(mockUserService.update).toHaveBeenCalledWith("1", updatedUser); // Garante que o service foi chamado com os argumentos corretos
    }); // create
    it("deve criar um usuário", async () => {
        const newUser = { name: "Jonas", email: "jonas@gmail.com" };
        mockUserService.create.mockResolvedValue(newUser); // Mock do retorno
        const result = await controller.create(newUser); // Chama o método do controller
        expect(result).toEqual(newUser); // Verifica se o retorno é igual ao mock
        expect(mockUserService.create).toHaveBeenCalledWith(newUser); // Garante que o service foi chamado com os argumentos corretos
    }); // remove
    it("deve remover um usuário", async () => {
        const userId = "1";
        const deletedUser = { id: userId, name: "Jonas" };
        mockUserService.remove.mockResolvedValue(deletedUser); // Mock do retorno
        const result = await controller.remove(userId); // Chama o método do controller
        expect(result).toEqual(deletedUser); // Verifica se o retorno é igual ao mock
        expect(mockUserService.remove).toHaveBeenCalledWith(userId); // Garante que o service foi chamado com o ID correto
    })
});