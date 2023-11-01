import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input, PasswordInput } from "../components/Input";
import { Link } from "react-router-dom";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const LoginPage = () => {
  // Accessing the login function from the AuthContext
  const { login } = useAuth();

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
      login(values);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="font-bold text-2xl">Login</h1>
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

        <Button type="submit">Login</Button>
      </form>
      <p className="hover:underline">
        Don&apos;t have an account yet?{" "}
        <Link to="/register" className="text-blue-500">
          Create One
        </Link>
      </p>
    </main>
  );
};
