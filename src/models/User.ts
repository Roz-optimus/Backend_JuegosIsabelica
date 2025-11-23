import { unique } from 'next/dist/build/utils'
import {Table, Column, Model, DataType,Default,Unique, AllowNull, BeforeCreate, BeforeUpdate} from 'sequelize-typescript'

@Table({
    tableName: 'users'
})

class User extends Model{
    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string

    @AllowNull(false)
     @Column({
        type: DataType.STRING(120)
    })
    declare password: string

    @AllowNull(false)
    @Unique(true)
     @Column({
        type: DataType.STRING(60)
    })
    declare email: string

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING(20)
    })
    declare phone: string

     @AllowNull(true)
     @Column({
        type: DataType.STRING(50)
    })

    declare token: string
     
     @Default(false) 
     @Column({
        type: DataType.BOOLEAN
    })
    declare confirmed: boolean

    @BeforeCreate
    static capatalizeName(instance: User){
        if(instance.name){
            instance.name =instance.name
            .toLowerCase()
            .trim()
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
        }
    }  

    @BeforeUpdate
    static capitalizeNameOnUpdate(instance:User){
        if(instance.name){
            instance.name = instance.name
            .toLowerCase()
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase()+ word.slice(1))
            .join(' ')
        }
    }
}

export default User