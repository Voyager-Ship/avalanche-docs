"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { countries } from "@/constants/countries";
import { Pencil, Github, X, Send, Link2 } from "lucide-react";

export default function Profile() {
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [username, setUsername] = useState("username");
  const [country, setCountry] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [github, setGithub] = useState("");
  const [socials, setSocials] = useState<string[]>([]);
  const [isFounder, setIsFounder] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [universityName, setUniversityName] = useState("");
  const [skills, setSkills] = useState<string[]>([
    "Foundary",
    "solidity",
    "python",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleAddSocial = () => {
    setSocials([...socials, ""]);
  };

  const handleUpdateSocial = (index: number, value: string) => {
    const newSocials = [...socials];
    newSocials[index] = value;
    setSocials(newSocials);
  };

  const handleRemoveSocial = (index: number) => {
    setSocials(socials.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Profile Picture */}
      <div className="flex items-start gap-6">
        <div
          className="relative"
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
        >
          <Avatar className="h-24 w-24">
            <AvatarImage src="" alt="Profile" />
            <AvatarFallback className="text-2xl">U</AvatarFallback>
          </Avatar>
          {isHoveringAvatar && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer transition-opacity">
              <span className="text-white text-sm font-medium">Edit</span>
            </div>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" placeholder="email@" disabled />
      </div>

      {/* Username */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Username</Label>
          <Pencil className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
        />
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label>Country</Label>
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {countries.map((countryOption) => (
              <SelectItem key={countryOption.value} value={countryOption.label}>
                {countryOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Company */}
      <div className="space-y-2">
        <Label>Company</Label>
        <Input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Enter company name"
        />
      </div>

      {/* Role */}
      <div className="space-y-2">
        <Label>Role</Label>
        <Input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Enter your role"
        />
      </div>

      {/* GitHub */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label>Github</Label>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="github.com/username"
          />
          <Button variant="outline" size="default">
            <Github className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>

      {/* Socials */}
      <div className="space-y-2">
        <Label>Socials (X, Telegram..)</Label>
        <div className="space-y-2">
          {socials.map((social, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={social}
                onChange={(e) => handleUpdateSocial(index, e.target.value)}
                placeholder="https://"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveSocial(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={handleAddSocial}
            className="w-fit"
          >
            <Link2 className="h-4 w-4 mr-2" />
            Add social link
          </Button>
        </div>
      </div>

      {/* Founder and Student Checkboxes */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="founder"
            checked={isFounder}
            onCheckedChange={(checked) => setIsFounder(checked as boolean)}
          />
          <Label htmlFor="founder" className="cursor-pointer">
            Founder?
          </Label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="student"
              checked={isStudent}
              onCheckedChange={(checked) => setIsStudent(checked as boolean)}
            />
            <Label htmlFor="student" className="cursor-pointer">
              Student?
            </Label>
          </div>
          {isStudent && (
            <div className="ml-6 space-y-2">
              <Label>University Name</Label>
              <Input
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="Enter university name"
              />
            </div>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label>Skills:</Label>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add skill"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddSkill();
              }
            }}
          />
          <Button variant="outline" onClick={handleAddSkill}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
