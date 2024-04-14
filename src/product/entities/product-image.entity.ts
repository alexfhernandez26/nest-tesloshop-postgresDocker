import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({name:'proudctimages'})
export class ProductImage{
    @PrimaryGeneratedColumn()
    id:string;

    @Column('text')
    url:string;

    @ManyToOne(() =>
    Product, product => product.images,
    /*{onDelete:'CASCADE'} con esto estamos diciendo que cuando uno o varios productos se eliminen, que 
    tambien elimine en cascada las imagenes asociadas a este producto */
    {onDelete:'CASCADE'}
    )
    product: Product
}