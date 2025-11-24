import Image from "next/image";
import TextInput from "./components/atoms/TextInput";
import PasswordInput from "./components/atoms/PasswordInput";
import Button from "./components/atoms/Button";

export default function Home() {
  return (
    <form className="pt-40 pb-20 col-flex items-center max-w-[270px] mx-auto">

<h1 className="mb-28">Sign up</h1>

<div className="col-flex gap-6 mb-15">
    <TextInput id="name" name="name" type="text" label="Personal / business name" placeholder="Enter your name" />
    <TextInput id="email" name="email" type="email" label="Email" placeholder="Enter your email" />
<PasswordInput id="password" name="password"  label="Password" placeholder="Enter your password" />
<PasswordInput id="confirm-password" name="confirm-password" label="Confirm password" placeholder="Enter your password" />
</div>

<div className="w-full col-flex gap-3.5">
  <Button className="bg-foreground text-background w-full">Create account</Button>  
  <Button className="border-2 border-foreground text-foreground w-full">Sign in</Button>  
</div>


    </form>
  );
}
