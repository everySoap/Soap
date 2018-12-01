import { Field, ID, ObjectType } from 'type-graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
@ObjectType()
export class User {
  @Field(type => ID)
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public nickname: string;

  @Field()
  @Column()
  public hash: string;

  @Field()
  @Column()
  public salt: string;

  @Field()
  @Column({
    unique: true,
  })
  public username: string;

  @Field()
  @Column({
    unique: true,
  })
  public email: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public avatar: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  public cover: string;

  @CreateDateColumn()
  public createdAt: Date;

}
