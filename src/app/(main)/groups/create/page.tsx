"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  ArrowLeftIcon,
  XMarkIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { CREATE_GROUP } from "@/lib/graphql/mutations";

const createGroupSchema = z.object({
  name: z
    .string()
    .min(3, "Group name must be at least 3 characters")
    .max(100, "Group name must be less than 100 characters"),
  about: z
    .string()
    .max(200, "About must be less than 200 characters")
    .optional(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  groupType: z.enum(["public", "closed", "hidden"]),
  actionRadius: z.enum([
    "regional",
    "national",
    "continental",
    "global",
    "interplanetary",
  ]),
  locationName: z
    .string()
    .max(100, "Location must be less than 100 characters")
    .optional(),
});

type CreateGroupFormData = z.infer<typeof createGroupSchema>;

export default function CreateGroupPage() {
  const router = useRouter();
  const [createGroup, { loading }] = useMutation(CREATE_GROUP);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateGroupFormData>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupType: "public",
      actionRadius: "regional",
    },
  });

  const groupType = watch("groupType");
  const actionRadius = watch("actionRadius");

  const onSubmit = async (data: CreateGroupFormData) => {
    try {
      const { data: result } = await createGroup({
        variables: {
          name: data.name.trim(),
          description: data.description.trim(),
          about: data.about?.trim() || null,
          groupType: data.groupType,
          actionRadius: data.actionRadius,
          locationName: data.locationName?.trim() || null,
          categoryIds: [], // TODO: Add category selection
        },
      });

      if (result?.CreateGroup) {
        toast.success("Group created successfully!");
        router.push(`/groups/${result.CreateGroup.slug}`);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create group";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/groups"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to Groups</span>
      </Link>

      <Card className="p-6 bg-gray-100 dark:bg-gray-900/50">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Create New Group
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Start a new community and bring people together around a shared
          interest or goal.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          {/* Group Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter a name for your group"
              {...register("name")}
              error={errors.name?.message}
            />
            <p className="mt-1 text-xs text-gray-500">3-100 characters</p>
          </div>

          {/* About */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              About (Short Summary)
            </label>
            <Textarea
              className="border border-gray-200 dark:border-gray-700"
              placeholder="A brief summary of your group..."
              rows={3}
              {...register("about")}
              error={errors.about?.message}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional, max 200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              className="border border-gray-200 dark:border-gray-700"
              placeholder="Describe your group in detail. What is it about? What are the goals? Who should join?"
              rows={6}
              {...register("description")}
              error={errors.description?.message}
            />
            <p className="mt-1 text-xs text-gray-500">
              At least 20 characters. Be descriptive!
            </p>
          </div>

          {/* Group Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={groupType}
              onValueChange={(value: string) =>
                setValue("groupType", value as "public" | "closed" | "hidden")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group type">
                  {groupType === "public" && "Public"}
                  {groupType === "closed" && "Private"}
                  {groupType === "hidden" && "Hidden"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div>
                    <div className="font-semibold">Public</div>
                    <div className="text-xs text-gray-500">
                      Anyone can see and join
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div>
                    <div className="font-semibold">Private</div>
                    <div className="text-xs text-gray-500">
                      Anyone can see, but members must be approved
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="hidden">
                  <div>
                    <div className="font-semibold">Hidden</div>
                    <div className="text-xs text-gray-500">
                      Only members can see this group
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.groupType && (
              <p className="mt-1 text-sm text-red-600">
                {errors.groupType.message}
              </p>
            )}
          </div>

          {/* Action Radius */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Action Radius <span className="text-red-500">*</span>
            </label>
            <Select
              value={actionRadius}
              onValueChange={(value: string) =>
                setValue("actionRadius", value as "regional" | "national" | "continental" | "global" | "interplanetary")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action radius">
                  {actionRadius
                    ? actionRadius.charAt(0).toUpperCase() +
                      actionRadius.slice(1)
                    : "Select action radius"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regional">Regional</SelectItem>
                <SelectItem value="national">National</SelectItem>
                <SelectItem value="continental">Continental</SelectItem>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="interplanetary">Interplanetary</SelectItem>
              </SelectContent>
            </Select>
            {errors.actionRadius && (
              <p className="mt-1 text-sm text-red-600">
                {errors.actionRadius.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <Input
              placeholder="City, Country (optional)"
              {...register("locationName")}
              error={errors.locationName?.message}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700 mt-6">
            <Link href="/groups">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
              >
                <XMarkIcon className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="default"
              isLoading={loading}
              disabled={loading}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
