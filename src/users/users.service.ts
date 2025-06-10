import { Injectable } from "@nestjs/common";

@Injectable()
export class Userservice{
    //banco de dados fake (array em memoria)
    private users = [
        {id:1,name:'joao',email:'joao@gmail.com'},
        {id:2,name:'maria',email:'maria@gmail.com'}
    ]
findAll(){
    return this.users
}

//buscar usuario por id 
findOne(id:number):{id:number,name:string,email:string}|undefined{
    const foundUser = this.users.find((u)=>u.id===id)
    return foundUser 
}
//cria novo usuario 
create(user:{name:string,email:string}):string{
    const newUser = {
        id:this.users.length + 1,
        name:user.name, 
        email:user.email
    }
    this.users.push(newUser)
    return`Usuario ${newUser.name} criado com o id: ${newUser.id}`
}
//atualizar um novo usuario
}
