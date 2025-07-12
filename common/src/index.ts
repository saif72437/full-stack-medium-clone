import z from "zod"


// zod validation
// backend will need this
export const signupInput = z.object({
    username: z.string(),
    password: z.string().min(6),
    name: z.string().optional()

})



// zod validation
// backend will need this
export const signinInput = z.object({
    username: z.string(),
    password: z.string().min(6)
    
})



// zod validation
// backend will need this
export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()
    
})



// zod validation
// backend will need this
export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()
    
})


// type inference | frontend will need this
export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>