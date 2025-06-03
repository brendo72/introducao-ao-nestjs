import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {

    //Banco de dados fake (array em memória)
    private users = [
        {id:1, name:'João', email:'joao@gmail.com'},
        {id:2, name:'Maria', email:'maria@gmail.com'}
    ]

    /*Faça um método que retorne todos os
    usuários do banco de dados fake: findAll*/
    findAll():{id:number, name:string, email:string}[] {
        return this.users
    }

    // buscar usuário por ID
    findOne(id: number):{id:number, name:string, email:string} | undefined{
        
        const foundUser = this.users.find((u)=> u.id === id)

        return foundUser
    }

    // Criar um novo usuário
    create(user:{name:string, email:string}): string{

        const newUser = {
            id: this.users.length + 1,
            name: user.name,
            email: user.email
        }

        this.users.push(newUser)

        return `Usuário ${newUser.name} criado com o ID ${newUser.id}`

    }




}