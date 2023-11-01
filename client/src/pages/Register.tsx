import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input, PasswordInput } from "../components/Input";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  const { createAccount } = useAuth();

  const formSchema = z
    .object({
      username: z
        .string()
        .min(3, {
          message: "Name must be at least 3 characters.",
        })
        .max(25, { message: "Name cannot be more than 25 characters" })
        .toLowerCase(),
      email: z
        .string()
        .email()
        .min(1, {
          message: "Please provide valid email address.",
        })
        .max(25, { message: "Name cannot be more than 25 characters" }),
      password: z
        .string()
        .min(6, { message: "Password should contain atleast 6 characters" }),

      confirmPassword: z
        .string()
        .min(6, { message: "Password should contain atleast 6 characters" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password doesn't match",
      path: ["confirmpassword"],
    });

  type ValidationSchema = z.infer<typeof formSchema>;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data: any) => {
    try {
      const { email, username, password } = data;
      const values = { email, username, password };
      createAccount(values);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="font-bold text-2xl">Create New Account</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-11/12 max-w-[512px] mx-auto flex flex-col items-center justify-center py-8 px-6 m-6"
      >
        <Input
          id="Username"
          label="Username"
          type="text"
          placeholder="Enter username"
          {...register("username")}
          error={errors.username && errors.username.message}
        />
        <Input
          id="Email"
          label="Email"
          type="text"
          placeholder="Enter email"
          {...register("email")}
          error={errors.email && errors.email.message}
        />

        <PasswordInput
          label="Password"
          id="password"
          placeholder="Enter Password"
          {...register("password")}
          error={errors.password && errors.password.message}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Confirm Password"
          {...register("confirmPassword")}
          error={errors.confirmPassword && errors.confirmPassword.message}
        />
        <Button type="submit">Create Account</Button>
      </form>
      <small className="hover:underline font-medium text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-500">
          Click to login
        </Link>
      </small>
    </main>
  );
};
