"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toaster } from "@/components/ui/toaster"
import { createDiscountCode, fetchAllDiscountCodes } from "@/lib/actions"
import { Copy, Plus, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

export default function DiscountsPage() {
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([])
  const [customCode, setCustomCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingCodes, setFetchingCodes] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    fetchDiscountCodes()
  }, [])

  const fetchDiscountCodes = async () => {
    setFetchingCodes(true)
    try {
      const result = await fetchAllDiscountCodes()
      if (result.success) {
        setGeneratedCodes(result.codes)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch discount codes",
        variant: "destructive",
      })
    }
    setFetchingCodes(false)
  }

  const handleGenerateCode = async () => {
    setLoading(true)
    try {
      const result = await createDiscountCode()
      if (result.success) {
        await fetchDiscountCodes() // Refresh the list
        toast({
          title: "Success",
          description: "New discount code generated",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate discount code",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const handleCreateCustomCode = async () => {
    if (!customCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a custom code",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await createDiscountCode(customCode)
      if (result.success) {
        await fetchDiscountCodes() // Refresh the list
        setCustomCode("")
        toast({
          title: "Success",
          description: "Custom discount code created",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create custom discount code",
        variant: "destructive",
      })
    }
    setLoading(false)
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Copied",
      description: "Discount code copied to clipboard",
    })
  }

  const filteredCodes = generatedCodes.filter((code) => {
    if (activeTab === "all") return true
    if (activeTab === "used") return code.used
    if (activeTab === "unused") return !code.used
    if (activeTab === "user") return code.userId
    if (activeTab === "admin") return !code.userId
    return true
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Discount Code Management</h1>

      <Alert className="mb-8">
        <Info className="h-4 w-4 mr-2" />
        <AlertTitle>Automatic Discount System</AlertTitle>
        <AlertDescription>
          The system automatically generates a discount code for users after every 3rd order. Manually created codes
          here can be used by any user.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Discount Code</CardTitle>
            <CardDescription>Create a new random discount code for 10% off</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateCode} disabled={loading} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Generate New Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Custom Code</CardTitle>
            <CardDescription>Create a custom discount code for 10% off</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="custom-code">Custom Code</Label>
                <Input
                  id="custom-code"
                  placeholder="Enter custom code (e.g., SUMMER10)"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateCustomCode} disabled={!customCode.trim() || loading}>
                Create Custom Code
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>All Discount Codes</CardTitle>
              <CardDescription>View and manage all discount codes</CardDescription>
            </div>
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="used">Used</TabsTrigger>
                <TabsTrigger value="unused">Unused</TabsTrigger>
                <TabsTrigger value="user">User</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {fetchingCodes ? (
            <p>Loading discount codes...</p>
          ) : filteredCodes.length === 0 ? (
            <p className="text-muted-foreground">No discount codes found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>
                      {code.used ? <Badge variant="secondary">Used</Badge> : <Badge variant="default">Available</Badge>}
                    </TableCell>
                    <TableCell>
                      {code.userId ? (
                        <Badge variant="outline">User Generated</Badge>
                      ) : (
                        <Badge variant="outline">Admin Generated</Badge>
                      )}
                    </TableCell>
                    <TableCell>{code.createdAt ? new Date(code.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code.code)}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}

