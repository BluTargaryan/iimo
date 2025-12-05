import Image from "next/image";
import TextInput from "../../components/atoms/TextInput";
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";

export default function Signup() {
  return (
    <form className=" col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">

<h1 className="mb-28">Sign up</h1>

<div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
    <TextInput id="name" name="name" type="text" label="Personal / business name" placeholder="Enter your name" />
    <TextInput id="email" name="email" type="email" label="Email" placeholder="Enter your email" />
<PasswordInput id="password" name="password"  label="Password" placeholder="Enter your password" />
<PasswordInput id="confirm-password" name="confirm-password" label="Confirm password" placeholder="Enter your password" />
</div>

<div className="w-full col-flex gap-3.5">
  <Button className="bg-foreground text-background w-full p-3.5">Create account</Button>  
  <Button className="border-2 border-foreground text-foreground w-full p-3.5">Sign in</Button>  
</div>


    </form>
  );
}
