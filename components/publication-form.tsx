"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  type: z.string(),
  level: z.string(),
  journal_name: z.string().min(2, {
    message: "Journal/publisher name is required.",
  }),
  volume_num: z.string().optional(),
  page_num: z.string().optional(),
  month_year: z.string(),
  issn: z.string().optional(),
  isbn: z.string().optional(),
  doi: z.string().optional(),
  abstract: z.string().optional(),
  peer_reviewed: z.boolean().default(false),
  in_scopus: z.boolean().default(false),
  in_ugc: z.boolean().default(false),
  in_clarivate: z.boolean().default(false),
  impact_factor: z.string().optional(),
  h_index: z.string().optional(),
  author: z.string().optional(),
})

export function PublicationForm({
  initialData = null,
  onSuccess,
  onCancel,
}: {
  initialData?: any
  onSuccess: () => void
  onCancel?: () => void
}) {
  const [authors, setAuthors] = useState<string[]>(initialData?.authors ? initialData.authors.split(", ") : [])
  const [keywords, setKeywords] = useState<string[]>(initialData?.keywords || [])
  const [currentAuthor, setCurrentAuthor] = useState("")
  const [currentKeyword, setCurrentKeyword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      type: initialData?.type?.toString() || "1",
      level: initialData?.level?.toString() || "2",
      journal_name: initialData?.journal_name || "",
      volume_num: initialData?.volume_num?.toString() || "",
      page_num: initialData?.page_num || "",
      month_year: initialData?.month_year ? new Date(initialData.month_year).toISOString().split("T")[0] : "",
      issn: initialData?.issn || "",
      isbn: initialData?.isbn || "",
      doi: initialData?.DOI || "",
      abstract: initialData?.abstract || "",
      peer_reviewed: initialData?.peer_reviewed || false,
      in_scopus: initialData?.in_scopus || false,
      in_ugc: initialData?.in_ugc || false,
      in_clarivate: initialData?.in_clarivate || false,
      impact_factor: initialData?.impact_factor?.toString() || "",
      h_index: initialData?.h_index?.toString() || "",
      author: "",
    },
  })

  const publicationType = form.watch("type")

  const addAuthor = () => {
    if (currentAuthor.trim() && !authors.includes(currentAuthor.trim())) {
      setAuthors([...authors, currentAuthor.trim()])
      setCurrentAuthor("")
      form.setValue("author", "")
    }
  }

  const removeAuthor = (index: number) => {
    const newAuthors = [...authors]
    newAuthors.splice(index, 1)
    setAuthors(newAuthors)
  }

  const addKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword("")
    }
  }

  const removeKeyword = (index: number) => {
    const newKeywords = [...keywords]
    newKeywords.splice(index, 1)
    setKeywords(newKeywords)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (authors.length === 0) {
      form.setError("author", {
        type: "manual",
        message: "At least one author is required.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real implementation, send the data to the API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const formData = {
        ...values,
        authors: authors.join(", "),
        keywords,
      }

      console.log("Form data:", formData)
      onSuccess()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publication Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the title of the publication" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Authors
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {authors.map((author, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                    {author}
                    <button
                      type="button"
                      onClick={() => removeAuthor(index)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add author name"
                  value={currentAuthor}
                  onChange={(e) => setCurrentAuthor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addAuthor()
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addAuthor}>
                  Add
                </Button>
              </div>
              {authors.length === 0 && <p className="text-sm text-red-500">At least one author is required.</p>}
            </div>
          </div>

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publication Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select publication type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Journal Article</SelectItem>
                    <SelectItem value="2">Book</SelectItem>
                    <SelectItem value="3">Book Chapter</SelectItem>
                    <SelectItem value="4">Conference Paper</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publication Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select publication level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">National</SelectItem>
                    <SelectItem value="2">International</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="journal_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {publicationType === "1" || publicationType === "4" ? "Journal/Conference Name" : "Publisher Name"}
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="month_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Publication Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {publicationType === "1" && (
            <>
              <FormField
                control={form.control}
                name="volume_num"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume/Issue Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Vol. 45, Issue 2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="page_num"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Numbers</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 123-145" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISSN</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2049-3630" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {(publicationType === "2" || publicationType === "3") && (
            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 978-3-16-148410-0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="doi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DOI</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 10.1234/journal.2023.45.123" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the abstract of the publication"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="px-2 py-1 text-sm">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword"
                value={currentKeyword}
                onChange={(e) => setCurrentKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addKeyword()
                  }
                }}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addKeyword}>
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Indexing
            </label>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="peer_reviewed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Peer Reviewed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="in_scopus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Scopus Indexed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="in_ugc"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>UGC Care Listed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="in_clarivate"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Web of Science</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="impact_factor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact Factor</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 3.2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="h_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel>H-Index</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 4.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Update Publication" : "Add Publication"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
