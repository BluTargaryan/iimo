import Image from "next/image";
import TextInput from "../../components/atoms/TextInput";
import PasswordInput from "../../components/atoms/PasswordInput";
import Button from "../../components/atoms/Button";

export default function Login() {
  return (
    <form className=" col-flex items-center max-w-[270px] mx-auto md:max-w-[493px]">

<div className="w-64 col-flex items-center gap-4 mb-28">
<h1 className="">Log in</h1>
{/* <span className="text-center">An OTP has been sent to you at example@gmail.com. Please add it below.</span> */}
</div>

<div className="col-flex gap-6 mb-15 w-full md:gap-7.5">
    <TextInput id="email" name="email" type="email" label="Email / title" placeholder="Enter your email or title" />

    <div className="w-full  col-flex items-center gap-3.5">
    <PasswordInput id="password" name="password"  label="Password" placeholder="Enter your password" />
    <span className="underline">Forgot password?</span>
    </div>

</div>

<div className="w-full col-flex gap-3.5">
  <Button className="bg-foreground text-background w-full p-3.5">Sign in</Button>  
  <Button className="border-2 border-foreground text-foreground w-full p-3.5">Sign up</Button>  
</div>


    </form>
  );
}
